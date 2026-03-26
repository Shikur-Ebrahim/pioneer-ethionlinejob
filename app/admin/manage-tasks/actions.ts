"use server";

import { getFirebaseAdminApp } from "@/lib/firebase/admin";
import { getFirestore } from "firebase-admin/firestore";

export async function getTasksServer() {
  const adminApp = getFirebaseAdminApp();
  if (!adminApp) return [];

  const db = getFirestore(adminApp);
  try {
    const snapshot = await db.collection("tasks").orderBy("createdAt", "desc").get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
    }));
  } catch (error) {
    console.error("getTasksServer error:", error);
    return [];
  }
}

export async function updateTaskServer(id: string, data: Record<string, any>) {
  const adminApp = getFirebaseAdminApp();
  if (!adminApp) throw new Error("Firebase not initialized");

  const db = getFirestore(adminApp);
  await db.collection("tasks").doc(id).update(data);
}

export async function deleteTaskServer(id: string) {
  const adminApp = getFirebaseAdminApp();
  if (!adminApp) throw new Error("Firebase not initialized");

  const db = getFirestore(adminApp);
  await db.collection("tasks").doc(id).delete();
}

export async function toggleTaskStatusServer(id: string, currentStatus: string) {
  const adminApp = getFirebaseAdminApp();
  if (!adminApp) throw new Error("Firebase not initialized");

  const db = getFirestore(adminApp);
  const newStatus = currentStatus === "active" ? "inactive" : "active";
  await db.collection("tasks").doc(id).update({ status: newStatus });
  return newStatus;
}
