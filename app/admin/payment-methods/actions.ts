"use server";

import { getFirebaseAdminApp } from "@/lib/firebase/admin";
import { getFirestore } from "firebase-admin/firestore";

export async function addPaymentMethod(method: any) {
  const adminApp = getFirebaseAdminApp();
  if (!adminApp) throw new Error("Firebase not initialized");
  
  const db = getFirestore(adminApp);
  
  try {
    const docRef = await db.collection("paymentMethods").add({
      ...method,
      status: "active",
      createdAt: new Date(),
    });
    return { id: docRef.id };
  } catch (error) {
    console.error("Error in addPaymentMethod:", error);
    throw new Error("Failed to add payment method");
  }
}

export async function getPaymentMethods() {
  const adminApp = getFirebaseAdminApp();
  if (!adminApp) return [];
  
  const db = getFirestore(adminApp);
  
  try {
    const snapshot = await db.collection("paymentMethods").orderBy("createdAt", "desc").get();
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : null,
        updatedAt: data.updatedAt?.toDate?.() ? data.updatedAt.toDate().toISOString() : null,
      };
    });
  } catch (error) {
    console.error("Error in getPaymentMethods:", error);
    return [];
  }
}

export async function deletePaymentMethod(id: string) {
  const adminApp = getFirebaseAdminApp();
  if (!adminApp) throw new Error("Firebase not initialized");
  
  const db = getFirestore(adminApp);
  
  try {
    await db.collection("paymentMethods").doc(id).delete();
    return { success: true };
  } catch (error) {
    console.error("Error in deletePaymentMethod:", error);
    throw new Error("Failed to delete payment method");
  }
}

export async function updatePaymentMethod(id: string, updates: any) {
  const adminApp = getFirebaseAdminApp();
  if (!adminApp) throw new Error("Firebase not initialized");
  
  const db = getFirestore(adminApp);
  
  try {
    await db.collection("paymentMethods").doc(id).update({
      ...updates,
      updatedAt: new Date(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error in updatePaymentMethod:", error);
    throw new Error("Failed to update payment method");
  }
}

export async function togglePaymentMethodStatus(id: string, currentStatus: string) {
  const adminApp = getFirebaseAdminApp();
  if (!adminApp) throw new Error("Firebase not initialized");
  
  const db = getFirestore(adminApp);
  const newStatus = currentStatus === "active" ? "inactive" : "active";
  
  try {
    await db.collection("paymentMethods").doc(id).update({
      status: newStatus,
      updatedAt: new Date(),
    });
    return { success: true, newStatus };
  } catch (error) {
    console.error("Error in togglePaymentMethodStatus:", error);
    throw new Error("Failed to toggle status");
  }
}
