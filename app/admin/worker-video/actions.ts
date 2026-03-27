"use server";

import { getFirebaseAdminApp } from "@/lib/firebase/admin";
import { getFirestore } from "firebase-admin/firestore";

type WorkerVideoInput = {
  imageId: string;
  mediaType?: string;
};

export async function getWorkerVideosServer() {
  const adminApp = getFirebaseAdminApp();
  if (!adminApp) return [];

  const db = getFirestore(adminApp);

  try {
    const snapshot = await db.collection("worker-video").orderBy("createdAt", "desc").get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
    }));
  } catch (error) {
    console.error("Error in getWorkerVideosServer:", error);
    return [];
  }
}

export async function addWorkerVideoServer(video: WorkerVideoInput) {
  const adminApp = getFirebaseAdminApp();
  if (!adminApp) throw new Error("Firebase not initialized");

  const db = getFirestore(adminApp);

  try {
    const docRef = await db.collection("worker-video").add({
      imageId: video.imageId,
      mediaType: video.mediaType ?? "video",
      createdAt: new Date(),
    });
    return { id: docRef.id };
  } catch (error) {
    console.error("Error in addWorkerVideoServer:", error);
    throw new Error("Failed to add worker video");
  }
}

export async function updateWorkerVideoServer(id: string, video: WorkerVideoInput) {
  const adminApp = getFirebaseAdminApp();
  if (!adminApp) throw new Error("Firebase not initialized");

  const db = getFirestore(adminApp);

  try {
    await db.collection("worker-video").doc(id).update({
      imageId: video.imageId,
      mediaType: video.mediaType ?? "video",
      updatedAt: new Date(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error in updateWorkerVideoServer:", error);
    throw new Error("Failed to update worker video");
  }
}

export async function deleteWorkerVideoServer(id: string) {
  const adminApp = getFirebaseAdminApp();
  if (!adminApp) throw new Error("Firebase not initialized");

  const db = getFirestore(adminApp);

  try {
    await db.collection("worker-video").doc(id).delete();
    return { success: true };
  } catch (error) {
    console.error("Error in deleteWorkerVideoServer:", error);
    throw new Error("Failed to delete worker video");
  }
}
