"use server";

import { getFirebaseAdminApp } from "@/lib/firebase/admin";
import { getFirestore } from "firebase-admin/firestore";

export async function getWorkflowStepsServer() {
  const adminApp = getFirebaseAdminApp();
  if (!adminApp) return [];

  const db = getFirestore(adminApp);
  try {
    const snapshot = await db.collection("workflow").orderBy("order", "asc").get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      text: doc.data().text,
      order: doc.data().order,
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null,
    }));
  } catch (error) {
    console.error("getWorkflowStepsServer error:", error);
    return [];
  }
}

export async function addWorkflowStepServer(text: string, order: number) {
  const adminApp = getFirebaseAdminApp();
  if (!adminApp) return { success: false, error: "Firebase Admin not initialized" };

  const db = getFirestore(adminApp);
  try {
    const res = await db.collection("workflow").add({
      text,
      order,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return { success: true, id: res.id };
  } catch (error) {
    console.error("addWorkflowStepServer error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to add workflow step" };
  }
}

export async function deleteWorkflowStepServer(id: string) {
  const adminApp = getFirebaseAdminApp();
  if (!adminApp) return { success: false, error: "Firebase Admin not initialized" };

  const db = getFirestore(adminApp);
  try {
    await db.collection("workflow").doc(id).delete();
    return { success: true };
  } catch (error) {
    console.error("deleteWorkflowStepServer error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete workflow step" };
  }
}

export async function updateWorkflowStepServer(id: string, text: string) {
  const adminApp = getFirebaseAdminApp();
  if (!adminApp) return { success: false, error: "Firebase Admin not initialized" };

  const db = getFirestore(adminApp);
  try {
    await db.collection("workflow").doc(id).update({
      text,
      updatedAt: new Date(),
    });
    return { success: true };
  } catch (error) {
    console.error("updateWorkflowStepServer error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to update workflow step" };
  }
}
