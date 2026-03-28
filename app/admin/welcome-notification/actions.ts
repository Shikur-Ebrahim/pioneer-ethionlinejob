"use server";

import { getFirebaseAdminApp } from "@/lib/firebase/admin";
import { getFirestore } from "firebase-admin/firestore";

const COLLECTION = "app_settings";
const DOC_ID = "welcome_notification";

export type WelcomeNotificationSettings = {
  maxDisplayCount: number;
};

const DEFAULT_MAX = 2;

function clampCount(n: number): number {
  if (!Number.isFinite(n)) return DEFAULT_MAX;
  return Math.min(10, Math.max(0, Math.round(n)));
}

export async function getWelcomeNotificationSettingsServer(): Promise<WelcomeNotificationSettings> {
  const adminApp = getFirebaseAdminApp();
  if (!adminApp) return { maxDisplayCount: DEFAULT_MAX };

  const db = getFirestore(adminApp);
  try {
    const doc = await db.collection(COLLECTION).doc(DOC_ID).get();
    if (!doc.exists) return { maxDisplayCount: DEFAULT_MAX };
    const raw = doc.data()?.maxDisplayCount;
    const n = typeof raw === "number" ? raw : Number(raw);
    return { maxDisplayCount: clampCount(Number.isFinite(n) ? n : DEFAULT_MAX) };
  } catch (error) {
    console.error("getWelcomeNotificationSettingsServer error:", error);
    return { maxDisplayCount: DEFAULT_MAX };
  }
}

export async function saveWelcomeNotificationSettingsServer(maxDisplayCount: number) {
  const adminApp = getFirebaseAdminApp();
  if (!adminApp) return { success: false, error: "Firebase not initialized" };

  const db = getFirestore(adminApp);
  const value = clampCount(maxDisplayCount);
  try {
    await db.collection(COLLECTION).doc(DOC_ID).set(
      {
        maxDisplayCount: value,
        updatedAt: new Date(),
      },
      { merge: true }
    );
    return { success: true };
  } catch (error) {
    console.error("saveWelcomeNotificationSettingsServer error:", error);
    return { success: false, error: "Failed to save settings" };
  }
}
