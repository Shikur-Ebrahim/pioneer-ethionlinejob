"use server";

import { getFirebaseAdminApp } from "@/lib/firebase/admin";
import { getFirestore } from "firebase-admin/firestore";

export async function getActiveTasksServer() {
  const adminApp = getFirebaseAdminApp();
  if (!adminApp) return [];

  const db = getFirestore(adminApp);
  try {
    // Fetch all tasks then filter active — avoids needing a Firestore composite index
    const snapshot = await db.collection("tasks").get();
    return snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
      }))
      .filter((t: any) => t.status === "active")
      .sort((a: any, b: any) =>
        (b.createdAt ?? "") > (a.createdAt ?? "") ? 1 : -1
      );
  } catch (error) {
    console.error("getActiveTasksServer error:", error);
    return [];
  }
}

export async function checkWorkerStatusServer(userId: string) {
  const adminApp = getFirebaseAdminApp();
  if (!adminApp) return false;

  const db = getFirestore(adminApp);
  try {
    const doc = await db.collection("workers").doc(userId).get();
    return doc.exists && doc.data()?.status === "active";
  } catch (error) {
    console.error("checkWorkerStatusServer error:", error);
    return false;
  }
}

export async function submitWorkerVerificationServer(userId: string, data: any) {
  const adminApp = getFirebaseAdminApp();
  if (!adminApp) return { success: false, error: "Firebase Admin not initialized" };

  const db = getFirestore(adminApp);
  try {
    await db.collection("workers").doc(userId).set({
      ...data,
      status: "pending", // Verification is pending admin review
      balance: 0,
      totalWithdrawal: 0,
      // Automatically tracked initial values (inactive by default)
      fee: "inactive",
      tiktok: "inactive",
      youtube: "inactive",
      facebook: "inactive",
      instagram: "inactive",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return { success: true };
  } catch (error) {
    console.error("submitWorkerVerificationServer error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to submit verification" };
  }
}
