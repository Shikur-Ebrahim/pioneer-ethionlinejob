"use server";

import { getFirebaseAdminApp } from "@/lib/firebase/admin";
import { getFirestore } from "firebase-admin/firestore";

export async function getWelcomeVideosServer() {
  const adminApp = getFirebaseAdminApp();
  const db = getFirestore(adminApp);
  
  try {
    const snapshot = await db.collection("welcome-video").orderBy("createdAt", "desc").get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Handle timestamp serialization for Next.js Server Actions
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null
    }));
  } catch (error) {
    console.error("Error in getWelcomeVideosServer:", error);
    throw new Error("Failed to fetch videos from server");
  }
}

export async function addWelcomeVideoServer(video: any) {
  const adminApp = getFirebaseAdminApp();
  const db = getFirestore(adminApp);
  
  try {
    const { id, title, status, ...data } = video;
    const docRef = await db.collection("welcome-video").add({
      ...data,
      createdAt: new Date(),
    });
    return { id: docRef.id };
  } catch (error) {
    console.error("Error in addWelcomeVideoServer:", error);
    throw new Error("Failed to add video");
  }
}

export async function updateWelcomeVideoServer(id: string, video: any) {
  const adminApp = getFirebaseAdminApp();
  const db = getFirestore(adminApp);
  
  try {
    const { id: _, ...data } = video;
    await db.collection("welcome-video").doc(id).update(data);
    return { success: true };
  } catch (error) {
    console.error("Error in updateWelcomeVideoServer:", error);
    throw new Error("Failed to update video");
  }
}

export async function deleteWelcomeVideoServer(id: string) {
  const adminApp = getFirebaseAdminApp();
  const db = getFirestore(adminApp);
  
  try {
    await db.collection("welcome-video").doc(id).delete();
    return { success: true };
  } catch (error) {
    console.error("Error in deleteWelcomeVideoServer:", error);
    throw new Error("Failed to delete video");
  }
}
