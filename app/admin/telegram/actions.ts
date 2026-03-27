"use server";

import { getFirebaseAdminApp } from "@/lib/firebase/admin";
import { getFirestore } from "firebase-admin/firestore";

export type TelegramSettings = {
  username: string;
  channelLink: string;
};

const COLLECTION = "telegrams";
const DOC_ID = "settings";

export async function getTelegramSettingsServer(): Promise<TelegramSettings> {
  const adminApp = getFirebaseAdminApp();
  if (!adminApp) return { username: "", channelLink: "" };

  const db = getFirestore(adminApp);
  try {
    const doc = await db.collection(COLLECTION).doc(DOC_ID).get();
    if (!doc.exists) return { username: "", channelLink: "" };
    const data = doc.data() || {};
    return {
      username: typeof data.username === "string" ? data.username : "",
      channelLink: typeof data.channelLink === "string" ? data.channelLink : "",
    };
  } catch (error) {
    console.error("getTelegramSettingsServer error:", error);
    return { username: "", channelLink: "" };
  }
}

export async function saveTelegramSettingsServer(input: TelegramSettings) {
  const adminApp = getFirebaseAdminApp();
  if (!adminApp) return { success: false, error: "Firebase not initialized" };

  const db = getFirestore(adminApp);
  try {
    await db.collection(COLLECTION).doc(DOC_ID).set(
      {
        username: input.username.trim(),
        channelLink: input.channelLink.trim(),
        updatedAt: new Date(),
      },
      { merge: true }
    );
    return { success: true };
  } catch (error) {
    console.error("saveTelegramSettingsServer error:", error);
    return { success: false, error: "Failed to save telegram settings" };
  }
}
