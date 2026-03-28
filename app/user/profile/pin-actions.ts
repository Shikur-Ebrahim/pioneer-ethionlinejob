"use server";

import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { getFirebaseAdminApp } from "@/lib/firebase/admin";
import { getFirestore } from "firebase-admin/firestore";

const PIN_REGEX = /^\d{5}$/;

function hashPin(pin: string, saltHex: string): Buffer {
  return scryptSync(pin, saltHex, 32);
}

export type WithdrawalPinStatus = {
  workerExists: boolean;
  feeActive: boolean;
  pinIsSet: boolean;
};

export async function getWithdrawalPinStatusServer(userId: string): Promise<WithdrawalPinStatus> {
  const adminApp = getFirebaseAdminApp();
  if (!adminApp) {
    return { workerExists: false, feeActive: false, pinIsSet: false };
  }

  const db = getFirestore(adminApp);
  try {
    const snap = await db.collection("workers").doc(userId).get();
    if (!snap.exists) {
      return { workerExists: false, feeActive: false, pinIsSet: false };
    }
    const d = snap.data() || {};
    const fee = typeof d.fee === "string" ? d.fee : "";
    const feeActive = fee === "active";
    const pinIsSet = !!(d.withdrawalPinHash && d.withdrawalPinSalt);
    return { workerExists: true, feeActive, pinIsSet };
  } catch (e) {
    console.error("getWithdrawalPinStatusServer", e);
    return { workerExists: false, feeActive: false, pinIsSet: false };
  }
}

export async function setWithdrawalPinServer(
  userId: string,
  currentPin: string | null,
  newPin: string,
  confirmPin: string
) {
  if (newPin !== confirmPin) {
    return { success: false as const, error: "New PIN and confirmation do not match" };
  }
  if (!PIN_REGEX.test(newPin)) {
    return { success: false as const, error: "PIN must be exactly 5 digits" };
  }

  const adminApp = getFirebaseAdminApp();
  if (!adminApp) return { success: false as const, error: "Server unavailable" };

  const db = getFirestore(adminApp);
  try {
    const ref = db.collection("workers").doc(userId);
    const snap = await ref.get();
    if (!snap.exists) {
      return { success: false as const, error: "Worker profile not found" };
    }
    const d = snap.data() || {};
    const fee = typeof d.fee === "string" ? d.fee : "";
    if (fee !== "active") {
      return {
        success: false as const,
        error: "Your registration fee must be verified (active) by admin before you can set a withdrawal PIN",
      };
    }

    const saltExisting = typeof d.withdrawalPinSalt === "string" ? d.withdrawalPinSalt : "";
    const hashExisting = typeof d.withdrawalPinHash === "string" ? d.withdrawalPinHash : "";
    const hasPin = saltExisting.length > 0 && hashExisting.length > 0;

    if (hasPin) {
      const cur = (currentPin ?? "").trim();
      if (!PIN_REGEX.test(cur)) {
        return { success: false as const, error: "Enter your current 5-digit PIN" };
      }
      const tryBuf = hashPin(cur, saltExisting);
      const storedBuf = Buffer.from(hashExisting, "hex");
      if (tryBuf.length !== storedBuf.length || !timingSafeEqual(tryBuf, storedBuf)) {
        return { success: false as const, error: "Current PIN is incorrect" };
      }
    }

    const newSalt = randomBytes(16).toString("hex");
    const newHash = hashPin(newPin, newSalt).toString("hex");

    await ref.update({
      withdrawalPinHash: newHash,
      withdrawalPinSalt: newSalt,
      withdrawalPinUpdatedAt: new Date(),
      updatedAt: new Date(),
    });
    return { success: true as const };
  } catch (e) {
    console.error("setWithdrawalPinServer", e);
    return { success: false as const, error: "Could not save PIN" };
  }
}
