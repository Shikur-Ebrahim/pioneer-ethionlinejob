"use server";

import { getFirebaseAdminApp } from "@/lib/firebase/admin";
import { getFirestore } from "firebase-admin/firestore";

export type WorkerProfileRecord =
  | {
      exists: true;
      fullName: string;
      idType: string;
      idFront: string;
      idBack: string;
      phoneNumber: string;
      totalWithdrawal: number;
      fee: string;
      facebook: string;
      instagram: string;
      tiktok: string;
      youtube: string;
      status: string;
      balance: number;
    }
  | { exists: false };

function str(v: unknown): string {
  return typeof v === "string" ? v : v != null ? String(v) : "";
}

export async function getWorkerProfileRecordServer(userId: string): Promise<WorkerProfileRecord> {
  const adminApp = getFirebaseAdminApp();
  if (!adminApp) return { exists: false };

  const db = getFirestore(adminApp);
  try {
    const doc = await db.collection("workers").doc(userId).get();
    if (!doc.exists) return { exists: false };
    const d = doc.data() || {};
    return {
      exists: true,
      fullName: str(d.fullName),
      idType: str(d.idType),
      idFront: str(d.idFront),
      idBack: str(d.idBack),
      phoneNumber: str(d.phoneNumber),
      totalWithdrawal: Math.max(0, Math.floor(Number(d.totalWithdrawal ?? 0))),
      fee: str(d.fee) || "inactive",
      facebook: str(d.facebook) || "inactive",
      instagram: str(d.instagram) || "inactive",
      tiktok: str(d.tiktok) || "inactive",
      youtube: str(d.youtube) || "inactive",
      status: str(d.status) || "pending",
      balance: Number(d.balance ?? 0),
    };
  } catch (error) {
    console.error("getWorkerProfileRecordServer error:", error);
    return { exists: false };
  }
}

export async function updateWorkerFullNameServer(userId: string, fullName: string) {
  const adminApp = getFirebaseAdminApp();
  if (!adminApp) return { success: false, error: "Server unavailable" };

  const trimmed = typeof fullName === "string" ? fullName.trim() : "";
  if (trimmed.length < 2) return { success: false, error: "Enter at least 2 characters" };
  if (trimmed.length > 120) return { success: false, error: "Name is too long" };

  const db = getFirestore(adminApp);
  try {
    const ref = db.collection("workers").doc(userId);
    const snap = await ref.get();
    if (!snap.exists) return { success: false, error: "Worker profile not found" };

    await ref.update({
      fullName: trimmed,
      updatedAt: new Date(),
    });
    return { success: true };
  } catch (error) {
    console.error("updateWorkerFullNameServer error:", error);
    return { success: false, error: "Could not update name" };
  }
}
