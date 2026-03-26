"use server";

import { getFirebaseAdminApp } from "@/lib/firebase/admin";
import { getFirestore } from "firebase-admin/firestore";

export async function addTaskServer(task: any) {
  const adminApp = getFirebaseAdminApp();
  if (!adminApp) throw new Error("Firebase not initialized");
  
  const db = getFirestore(adminApp);
  
  try {
    const docRef = await db.collection("tasks").add({
      ...task,
      createdAt: new Date(),
      status: "active"
    });
    return { id: docRef.id };
  } catch (error) {
    console.error("Error in addTaskServer:", error);
    throw new Error("Failed to add task");
  }
}

export async function getTasksServer() {
  const adminApp = getFirebaseAdminApp();
  if (!adminApp) return [];
  
  const db = getFirestore(adminApp);
  
  try {
    const snapshot = await db.collection("tasks").orderBy("createdAt", "desc").get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null
    }));
  } catch (error) {
    console.error("Error in getTasksServer:", error);
    return [];
  }
}
export async function getTaskServer(taskId: string) {
  const adminApp = getFirebaseAdminApp();
  if (!adminApp) throw new Error("Firebase not initialized");
  
  const db = getFirestore(adminApp);
  
  try {
    const doc = await db.collection("tasks").doc(taskId).get();
    if (!doc.exists) return null;
    
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data()?.createdAt?.toDate?.()?.toISOString() || null
    };
  } catch (error) {
    console.error("Error in getTaskServer:", error);
    throw new Error("Failed to fetch task");
  }
}
