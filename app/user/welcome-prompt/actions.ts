"use server";

import { getFirebaseAdminApp } from "@/lib/firebase/admin";
import { getFirestore } from "firebase-admin/firestore";
import { getWelcomeNotificationSettingsServer } from "@/app/admin/welcome-notification/actions";
import { getPaymentMethods } from "@/app/admin/payment-methods/actions";
import { getActiveTasksServer } from "@/app/user/work/actions";

const USER_PREFS = "user_prefs";

async function needsWorkerApplicationServer(userId: string): Promise<boolean> {
  const adminApp = getFirebaseAdminApp();
  if (!adminApp) return false;

  const db = getFirestore(adminApp);
  const doc = await db.collection("workers").doc(userId).get();
  if (!doc.exists) return true;
  const status = doc.data()?.status as string | undefined;
  if (status === "pending") return false;
  if (status === "verified" || status === "active") return false;
  return true;
}

function resolveWorkerFeeFromMethods(methods: unknown[]): number {
  if (!methods?.length) return 100;
  const list = methods as { status?: string; workerFee?: unknown }[];
  const active = list.find((m) => m.status === "active");
  const src = active ?? list[0];
  const n = Number(src?.workerFee ?? 100);
  return Number.isFinite(n) ? n : 100;
}

export type WelcomePromptState = {
  needsApplication: boolean;
  shownCount: number;
  maxDisplayCount: number;
  firstActiveTaskId: string | null;
  workerFee: number;
};

export async function getWelcomePromptStateServer(userId: string): Promise<WelcomePromptState> {
  const adminApp = getFirebaseAdminApp();
  const defaults: WelcomePromptState = {
    needsApplication: false,
    shownCount: 0,
    maxDisplayCount: 2,
    firstActiveTaskId: null,
    workerFee: 100,
  };
  if (!adminApp) return defaults;

  const db = getFirestore(adminApp);
  try {
    const [settings, needsApplication, prefSnap, tasks, paymentRows] = await Promise.all([
      getWelcomeNotificationSettingsServer(),
      needsWorkerApplicationServer(userId),
      db.collection(USER_PREFS).doc(userId).get(),
      getActiveTasksServer(),
      getPaymentMethods(),
    ]);

    const shownCount = prefSnap.exists
      ? Math.max(0, Math.floor(Number(prefSnap.data()?.applyWorkWelcomeShownCount ?? 0)))
      : 0;

    const first = Array.isArray(tasks) && tasks.length > 0 ? String((tasks[0] as { id?: string }).id || "") : "";
    const workerFee = resolveWorkerFeeFromMethods(Array.isArray(paymentRows) ? paymentRows : []);
    return {
      needsApplication,
      shownCount,
      maxDisplayCount: settings.maxDisplayCount,
      firstActiveTaskId: first || null,
      workerFee,
    };
  } catch (error) {
    console.error("getWelcomePromptStateServer error:", error);
    return defaults;
  }
}

export async function recordWelcomePromptShownServer(userId: string, tabSessionId: string) {
  const adminApp = getFirebaseAdminApp();
  if (!adminApp) return { success: false, error: "Firebase not initialized" };
  const sid = typeof tabSessionId === "string" && tabSessionId.length > 0 ? tabSessionId : "_";

  const db = getFirestore(adminApp);
  const ref = db.collection(USER_PREFS).doc(userId);
  try {
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const data = snap.data() || {};
      if (data.lastWelcomeTabSessionId === sid) return;
      const n = Math.max(0, Math.floor(Number(data.applyWorkWelcomeShownCount ?? 0)));
      tx.set(
        ref,
        {
          applyWorkWelcomeShownCount: n + 1,
          lastWelcomeTabSessionId: sid,
          updatedAt: new Date(),
        },
        { merge: true }
      );
    });
    return { success: true };
  } catch (error) {
    console.error("recordWelcomePromptShownServer error:", error);
    return { success: false, error: "Failed to record impression" };
  }
}
