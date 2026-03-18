"use server";

import { getFirebaseAdminApp } from "@/lib/firebase/admin";
import { getFirestore } from "firebase-admin/firestore";

const COLLECTION_NAME = "banners";

export async function getBannersServer() {
  const adminApp = getFirebaseAdminApp();
  if (!adminApp) return [];
  
  const db = getFirestore(adminApp);
  
  try {
    const snapshot = await db.collection(COLLECTION_NAME).orderBy("createdAt", "desc").get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null
    }));
  } catch (error) {
    console.error("Error in getBannersServer:", error);
    return [];
  }
}

export async function addBannerServer(banner: any) {
  const adminApp = getFirebaseAdminApp();
  if (!adminApp) throw new Error("Firebase not initialized");
  
  const db = getFirestore(adminApp);
  
  try {
    const { id, ...data } = banner;
    const docRef = await db.collection(COLLECTION_NAME).add({
      ...data,
      createdAt: new Date(),
    });
    return { id: docRef.id };
  } catch (error) {
    console.error("Error in addBannerServer:", error);
    throw new Error("Failed to add banner");
  }
}

export async function updateBannerServer(id: string, banner: any) {
  const adminApp = getFirebaseAdminApp();
  if (!adminApp) throw new Error("Firebase not initialized");
  
  const db = getFirestore(adminApp);
  
  try {
    const { id: _, ...data } = banner;
    await db.collection(COLLECTION_NAME).doc(id).update(data);
    return { success: true };
  } catch (error) {
    console.error("Error in updateBannerServer:", error);
    throw new Error("Failed to update banner");
  }
}

export async function deleteBannerServer(id: string) {
  const adminApp = getFirebaseAdminApp();
  if (!adminApp) throw new Error("Firebase not initialized");
  
  const db = getFirestore(adminApp);
  
  try {
    await db.collection(COLLECTION_NAME).doc(id).delete();
    return { success: true };
  } catch (error) {
    console.error("Error in deleteBannerServer:", error);
    throw new Error("Failed to delete banner");
  }
}
