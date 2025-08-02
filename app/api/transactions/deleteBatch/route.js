import { db } from "@/app/lib/firebaseAdmin";
import { NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { isValidDate } from "@/app/lib/utils/util";

export async function POST(req) {
  try {
    // Use await req.text() and parse JSON manually for better error handling
    let body;
    try {
      const text = await req.text();
      body = JSON.parse(text);
    } catch {
      return NextResponse.json({ status: 400, error: "Invalid JSON body" });
    }
    const { userId, startDateStr, endDateStr } = body;

    if (!userId) {
      return NextResponse.json({ status: 400, error: "User ID is required!" });
    }

    if (startDateStr && !isValidDate(startDateStr)) {
      return NextResponse.json({
        status: 400,
        error: "Invalid startDate format. Use YYYY-MM-DD.",
      });
    }

    if (endDateStr && !isValidDate(endDateStr)) {
      return NextResponse.json({
        status: 400,
        error: "Invalid endDate format. Use YYYY-MM-DD.",
      });
    }

    const startDate = Timestamp.fromDate(new Date(`${startDateStr}T00:00:00Z`));
    const endDate = Timestamp.fromDate(new Date(`${endDateStr}T23:59:59Z`));

    const transactionsRef = db
      .collection("users")
      .doc(userId)
      .collection("transactions")
      .where("date", ">=", startDate)
      .where("date", "<=", endDate);

    const totalsRef = db
      .collection("users")
      .doc(userId)
      .collection("dailyTotals")
      .where("date", ">=", startDate)
      .where("date", "<=", endDate);

    const snapshot = await transactionsRef.get();
    const totalsSnapshot = await totalsRef.get();

    if (snapshot.empty) {
      return NextResponse.json({
        status: 404,
        message: "No transactions found",
      });
    }

    // Batch delete (Firestore limit: 500 per batch)

    let batch = db.batch();
    let count = 0;
    for (const doc of snapshot.docs) {
      batch.delete(doc.ref);
      count++;
      if (count % 500 === 0) {
        await batch.commit();
        batch = db.batch();
      }
    }
    for (const doc of totalsSnapshot.docs) {
      batch.delete(doc.ref);
      count++;
      if (count % 500 === 0) {
        await batch.commit();
        batch = db.batch();
      }
    }
    if (count % 500 !== 0) {
      await batch.commit();
    }

    return NextResponse.json({ status: 200, deleted: count });
  } catch (error) {
    return NextResponse.json({ status: 500, error: error.message });
  }
}
