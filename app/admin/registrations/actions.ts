"use server";

import { getFirebaseAdminApp } from "@/lib/firebase/admin";
import { getFirestore } from "firebase-admin/firestore";

export async function getPendingWorkersServer() {
  const adminApp = getFirebaseAdminApp();
  if (!adminApp) return [];

  const db = getFirestore(adminApp);
  try {
    const snapshot = await db.collection("workers").get();
    console.log("Total worker records found:", snapshot.size);
    
    return snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null,
      }))
      .filter((w: any) => w.status === "pending")
      .sort((a, b) => (b.createdAt ?? "") > (a.createdAt ?? "") ? 1 : -1);
  } catch (error) {
    console.error("getPendingWorkersServer error:", error);
    return [];
  }
}

export async function approveRegistrationServer(userId: string) {
  const adminApp = getFirebaseAdminApp();
  if (!adminApp) return { success: false, error: "Firebase Admin not initialized" };

  const db = getFirestore(adminApp);
  try {
    await db.collection("workers").doc(userId).update({
      status: "verified",
      fee: "active",
      updatedAt: new Date(),
    });
    return { success: true };
  } catch (error) {
    console.error("approveRegistrationServer error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to approve registration" };
  }
}

export async function rejectRegistrationServer(userId: string) {
  const adminApp = getFirebaseAdminApp();
  if (!adminApp) return { success: false, error: "Firebase Admin not initialized" };

  const db = getFirestore(adminApp);
  try {
    await db.collection("workers").doc(userId).delete();
    return { success: true };
  } catch (error) {
    console.error("rejectRegistrationServer error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to reject registration" };
  }
}

export async function getPendingCountServer() {
  const adminApp = getFirebaseAdminApp();
  if (!adminApp) return 0;

  const db = getFirestore(adminApp);
  try {
    const snapshot = await db.collection("workers").get();
    return snapshot.docs.filter((doc) => doc.data().status === "pending").length;
  } catch (error) {
    console.error("getPendingCountServer error:", error);
    return 0;
  }
}
