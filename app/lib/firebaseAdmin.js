import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

// ✅ Parse Firebase Admin SDK Credentials Safely
let serviceAccount;
try {
  if (!process.env.FIREBASE_ADMIN_SDK) {
    throw new Error("FIREBASE_ADMIN_SDK environment variable is missing.");
  }
  serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK);

  // Ensure private key is formatted correctly
  if (serviceAccount.private_key.includes("\\n")) {
    serviceAccount.private_key = serviceAccount.private_key.replace(
      /\\n/g,
      "\n"
    );
  }
} catch (error) {
  throw new Error(error.message || "Invalid Firebase Admin SDK credentials.");
}

// ✅ Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const db = getFirestore();
const auth = getAuth();

export { db, auth };
