import { db } from "@/app/lib/firebaseAdmin";
import { NextResponse } from "next/server";
import { isValidDate } from "@/app/lib/utils/util";
import { Timestamp } from "firebase-admin/firestore";
import { format, startOfMonth, endOfMonth } from "date-fns";

const today = new Date();
const firstDay = startOfMonth(today);
const lastDay = endOfMonth(today);

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const currency = searchParams.get("currency") || "";
    const userId = searchParams.get("userId") || null;
    const type = searchParams.get("type") || "";
    const category = searchParams.get("category") || "";
    const startDateStr =
      searchParams.get("startDate") || format(firstDay, "yyyy-MM-dd");
    const endDateStr =
      searchParams.get("endDate") || format(lastDay, "yyyy-MM-dd");

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

    // Firestore queries
    let tranQuery = db
      .collection("users")
      .doc(userId)
      .collection("transactions");

    if (currency) {
      tranQuery = tranQuery.where("currency", "==", currency);
    }

    if (type) {
      tranQuery = tranQuery.where("type", "==", type);

      if (category) {
        tranQuery = tranQuery.where("category", "==", category);
      }
    }

    if (startDate) {
      tranQuery = tranQuery.where("date", ">=", startDate);

      if (endDate) {
        tranQuery = tranQuery.where("date", "<=", endDate);
      }
    }

    const transactionsSnapshot = await tranQuery.get();
    const transactions = transactionsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        date: data.date.toDate().toISOString(), // 🔥 Convert Timestamp to local time string
      };
    });

    if (transactions.length === 0) {
      return NextResponse.json({
        status: 404,
        error: "No transactions found.",
      });
    }

    return NextResponse.json({
      status: 200,
      transactions,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json({
      status: 500,
      error: error.message || "Internal Server Error",
    });
  }
}
