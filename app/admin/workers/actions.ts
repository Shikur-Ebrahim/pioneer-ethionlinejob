"use server";

import { getFirebaseAdminApp } from "@/lib/firebase/admin";
import { getFirestore } from "firebase-admin/firestore";

export async function getAllWorkersServer() {
  const adminApp = getFirebaseAdminApp();
  if (!adminApp) return [];

  const db = getFirestore(adminApp);
  try {
    const snapshot = await db.collection("workers").orderBy("createdAt", "desc").get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null,
    }));
  } catch (error) {
    console.error("getAllWorkersServer error:", error);
    return [];
  }
}

export async function updateWorkerStatusServer(userId: string, status: string) {
  const adminApp = getFirebaseAdminApp();
  if (!adminApp) return { success: false, error: "Firebase Admin not initialized" };

  const db = getFirestore(adminApp);
  try {
    await db.collection("workers").doc(userId).update({
      status,
      updatedAt: new Date(),
    });
    return { success: true };
  } catch (error) {
    console.error("updateWorkerStatusServer error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to update status" };
  }
}
