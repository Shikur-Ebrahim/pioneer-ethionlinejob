"use server";

import { getFirebaseAdminApp } from "@/lib/firebase/admin";
import { getFirestore } from "firebase-admin/firestore";

export async function getHomeVideosServer() {
  const adminApp = getFirebaseAdminApp();
  if (!adminApp) return [];
  
  const db = getFirestore(adminApp);
  
  try {
    const snapshot = await db.collection("home-video").orderBy("createdAt", "desc").get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Handle timestamp serialization for Next.js Server Actions
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null
    }));
  } catch (error) {
    console.error("Error in getHomeVideosServer:", error);
    return [];
  }
}

export async function addHomeVideoServer(video: any) {
  const adminApp = getFirebaseAdminApp();
  if (!adminApp) throw new Error("Firebase not initialized");
  
  const db = getFirestore(adminApp);
  
  try {
    const { id, title, status, ...data } = video;
    const docRef = await db.collection("home-video").add({
      ...data,
      createdAt: new Date(),
    });
    return { id: docRef.id };
  } catch (error) {
    console.error("Error in addHomeVideoServer:", error);
    throw new Error("Failed to add video");
  }
}

export async function updateHomeVideoServer(id: string, video: any) {
  const adminApp = getFirebaseAdminApp();
  if (!adminApp) throw new Error("Firebase not initialized");
  
  const db = getFirestore(adminApp);
  
  try {
    const { id: _, ...data } = video;
    await db.collection("home-video").doc(id).update(data);
    return { success: true };
  } catch (error) {
    console.error("Error in updateHomeVideoServer:", error);
    throw new Error("Failed to update video");
  }
}

export async function deleteHomeVideoServer(id: string) {
  const adminApp = getFirebaseAdminApp();
  if (!adminApp) throw new Error("Firebase not initialized");
  
  const db = getFirestore(adminApp);
  
  try {
    await db.collection("home-video").doc(id).delete();
    return { success: true };
  } catch (error) {
    console.error("Error in deleteHomeVideoServer:", error);
    throw new Error("Failed to delete video");
  }
}
