"use server";

import { getFirebaseAdminApp } from "@/lib/firebase/admin";
import { getFirestore } from "firebase-admin/firestore";

const WORKER_TASKS_COLLECTION = "worker-tasks";

export async function getActiveTasksServer() {
  const adminApp = getFirebaseAdminApp();
  if (!adminApp) return [];

  const db = getFirestore(adminApp);
  try {
    // Fetch all tasks then filter active — avoids needing a Firestore composite index
    const snapshot = await db.collection("tasks").get();
    return snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
      }))
      .filter((t: any) => t.status === "active")
      .sort((a: any, b: any) =>
        (b.createdAt ?? "") > (a.createdAt ?? "") ? 1 : -1
      );
  } catch (error) {
    console.error("getActiveTasksServer error:", error);
    return [];
  }
}

export async function checkWorkerStatusServer(userId: string) {
  const adminApp = getFirebaseAdminApp();
  if (!adminApp) return false;

  const db = getFirestore(adminApp);
  try {
    const doc = await db.collection("workers").doc(userId).get();
    const status = doc.data()?.status;
    // Admin approvals set status to "verified" (per admin registrations flow).
    return doc.exists && (status === "verified" || status === "active");
  } catch (error) {
    console.error("checkWorkerStatusServer error:", error);
    return false;
  }
}

/** Verified worker + admin-set fee active — required to start/complete fee tasks. */
export async function canWorkerPerformFeeTasksServer(
  userId: string
): Promise<{ ok: boolean; reason?: "no_worker" | "not_verified" | "fee_inactive" }> {
  const adminApp = getFirebaseAdminApp();
  if (!adminApp) return { ok: false, reason: "no_worker" };

  const db = getFirestore(adminApp);
  try {
    const doc = await db.collection("workers").doc(userId).get();
    if (!doc.exists) return { ok: false, reason: "no_worker" };
    const d = doc.data() || {};
    const status = d.status as string | undefined;
    const fee = d.fee as string | undefined;
    const statusOk = status === "verified" || status === "active";
    if (!statusOk) return { ok: false, reason: "not_verified" };
    if (fee !== "active") return { ok: false, reason: "fee_inactive" };
    return { ok: true };
  } catch (error) {
    console.error("canWorkerPerformFeeTasksServer error:", error);
    return { ok: false, reason: "no_worker" };
  }
}

const EARNING_RECORDS_COLLECTION = "earning_records";

export type EarningRecordListItem = {
  id: string;
  userId: string;
  taskId: string;
  reward: number;
  completedAt: string | null;
  platform: string;
  adPrice: number;
  workerPrice: number;
  socialMediaPrice: number;
  mediaId: string;
  mediaType: string;
  campaign: {
    totalViews?: string;
    targetUsers?: string;
    timeAchieved?: string;
    targetCountries?: { country?: string; exactViews?: string; percentage?: number }[];
  };
};

export async function getEarningRecordsServer(userId: string): Promise<EarningRecordListItem[]> {
  const adminApp = getFirebaseAdminApp();
  if (!adminApp) return [];

  const db = getFirestore(adminApp);
  try {
    const snap = await db.collection(EARNING_RECORDS_COLLECTION).where("userId", "==", userId).get();
    const rows: EarningRecordListItem[] = snap.docs.map((doc) => {
      const x = doc.data() || {};
      return {
        id: doc.id,
        userId: String(x.userId ?? ""),
        taskId: String(x.taskId ?? ""),
        reward: Number(x.reward ?? 0),
        completedAt: x.completedAt?.toDate?.()?.toISOString?.() ?? null,
        platform: String(x.platform ?? "free"),
        adPrice: Number(x.adPrice ?? 0),
        workerPrice: Number(x.workerPrice ?? x.reward ?? 0),
        socialMediaPrice: Number(x.socialMediaPrice ?? 0),
        mediaId: String(x.mediaId ?? ""),
        mediaType: String(x.mediaType ?? "image"),
        campaign: (x.campaign as EarningRecordListItem["campaign"]) || {},
      };
    });
    rows.sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? ""));
    return rows;
  } catch (error) {
    console.error("getEarningRecordsServer error:", error);
    return [];
  }
}

export async function submitWorkerVerificationServer(userId: string, data: any) {
  const adminApp = getFirebaseAdminApp();
  if (!adminApp) return { success: false, error: "Firebase Admin not initialized" };

  const db = getFirestore(adminApp);
  try {
    await db.collection("workers").doc(userId).set({
      ...data,
      status: "pending", // Verification is pending admin review
      balance: 0,
      totalWithdrawal: 0,
      // Automatically tracked initial values (inactive by default)
      fee: "inactive",
      tiktok: "inactive",
      youtube: "inactive",
      facebook: "inactive",
      instagram: "inactive",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return { success: true };
  } catch (error) {
    console.error("submitWorkerVerificationServer error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to submit verification" };
  }
}

function parseTimeAchievedToMs(input: unknown): number {
  const s = typeof input === "string" ? input.trim() : "";
  // Expected: "30 Min" | "2 Hour" | "1 Day"
  const match = s.match(/^(\d+(?:\.\d+)?)\s*(Min|Minute|Hour|Day)\b/i);
  if (!match) return 0;
  const value = Number(match[1]);
  const unit = match[2].toLowerCase();
  if (!Number.isFinite(value) || value <= 0) return 0;
  if (unit.startsWith("min")) return value * 60 * 1000;
  if (unit.startsWith("hour")) return value * 60 * 60 * 1000;
  if (unit.startsWith("day")) return value * 24 * 60 * 60 * 1000;
  return 0;
}

export async function getWorkerAccessServer(userId: string) {
  const adminApp = getFirebaseAdminApp();
  if (!adminApp) return null;

  const db = getFirestore(adminApp);
  const doc = await db.collection("workers").doc(userId).get();
  if (!doc.exists) return null;
  return {
    id: doc.id,
    ...(doc.data() || {}),
  };
}

export type WorkerHomeSnapshot =
  | { exists: false; balance: number; totalWithdrawal: number }
  | {
      exists: true;
      balance: number;
      totalWithdrawal: number;
      status?: string;
    };

export async function getWorkerHomeSnapshotServer(userId: string): Promise<WorkerHomeSnapshot> {
  const adminApp = getFirebaseAdminApp();
  if (!adminApp) return { exists: false, balance: 0, totalWithdrawal: 0 };

  const db = getFirestore(adminApp);
  try {
    const doc = await db.collection("workers").doc(userId).get();
    if (!doc.exists) {
      return { exists: false, balance: 0, totalWithdrawal: 0 };
    }
    const d = doc.data() || {};
    return {
      exists: true,
      balance: Number(d.balance ?? 0),
      totalWithdrawal: Number(d.totalWithdrawal ?? 0),
      status: typeof d.status === "string" ? d.status : undefined,
    };
  } catch (error) {
    console.error("getWorkerHomeSnapshotServer error:", error);
    return { exists: false, balance: 0, totalWithdrawal: 0 };
  }
}

export async function getWorkerTaskProgressServer(userId: string, taskId: string) {
  const adminApp = getFirebaseAdminApp();
  if (!adminApp) return null;
  const db = getFirestore(adminApp);

  const progressId = `${userId}_${taskId}`;
  const doc = await db.collection(WORKER_TASKS_COLLECTION).doc(progressId).get();
  if (!doc.exists) return { status: "not_started" as const };

  const data = doc.data() || {};
  const status = (data.status as string) || "working";

  const dueAt = data.dueAt?.toDate?.()?.toISOString?.() ?? null;
  const completedAt = data.completedAt?.toDate?.()?.toISOString?.() ?? null;
  const startedAt = data.startedAt?.toDate?.()?.toISOString?.() ?? null;

  return {
    status: status === "completed" ? ("completed" as const) : ("working" as const),
    dueAt,
    completedAt,
    startedAt,
  };
}

export async function startWorkerTaskServer(userId: string, taskId: string) {
  const adminApp = getFirebaseAdminApp();
  if (!adminApp) return { success: false, error: "Firebase Admin not initialized" };
  const db = getFirestore(adminApp);

  const gate = await canWorkerPerformFeeTasksServer(userId);
  if (!gate.ok) {
    if (gate.reason === "fee_inactive") {
      return {
        success: false,
        error: "Your registration fee must be active (verified by admin) before you can run tasks.",
      };
    }
    if (gate.reason === "not_verified") {
      return {
        success: false,
        error: "Complete worker verification and wait for approval before taking tasks.",
      };
    }
    return { success: false, error: "Worker profile required" };
  }

  const workerRef = db.collection("workers").doc(userId);
  const taskRef = db.collection("tasks").doc(taskId);
  const progressId = `${userId}_${taskId}`;
  const progressRef = db.collection(WORKER_TASKS_COLLECTION).doc(progressId);

  const [workerDoc, taskDoc] = await Promise.all([workerRef.get(), taskRef.get()]);
  if (!taskDoc.exists) return { success: false, error: "Task not found" };
  if (!workerDoc.exists) return { success: false, error: "Worker not found" };

  const task = taskDoc.data() || {};
  const timeAchieved = task?.campaign?.timeAchieved;
  const durationMs = parseTimeAchievedToMs(timeAchieved);
  // If time is not set correctly, allow immediate work but still create progress row.
  const now = Date.now();
  const dueAtDate = new Date(now + Math.max(durationMs, 0));

  const existing = await progressRef.get();
  const existingData = existing.exists ? (existing.data() || {}) : {};
  if (existing.exists && existingData.status === "completed") {
    return { success: true, alreadyCompleted: true };
  }

  if (!existing.exists) {
    await progressRef.set({
      userId,
      taskId,
      status: "working",
      startedAt: new Date(),
      dueAt: dueAtDate,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } else {
    // If working already, don't extend timer.
    if (existingData.status !== "working") {
      await progressRef.update({
        status: "working",
        startedAt: existingData.startedAt ?? new Date(),
        dueAt: existingData.dueAt ?? dueAtDate,
        updatedAt: new Date(),
      });
    }
  }

  return {
    success: true,
    dueAt: dueAtDate.toISOString(),
    durationMs,
  };
}

export async function completeWorkerTaskServer(userId: string, taskId: string) {
  const adminApp = getFirebaseAdminApp();
  if (!adminApp) return { success: false, error: "Firebase Admin not initialized" };
  const db = getFirestore(adminApp);

  const workerRef = db.collection("workers").doc(userId);
  const taskRef = db.collection("tasks").doc(taskId);
  const progressId = `${userId}_${taskId}`;
  const progressRef = db.collection(WORKER_TASKS_COLLECTION).doc(progressId);

  const [workerDoc, taskDoc, progressDoc] = await Promise.all([
    workerRef.get(),
    taskRef.get(),
    progressRef.get(),
  ]);

  if (!taskDoc.exists) return { success: false, error: "Task not found" };
  if (!workerDoc.exists) return { success: false, error: "Worker not found" };
  if (!progressDoc.exists) return { success: false, error: "Task not started" };

  const progressData = progressDoc.data() || {};
  if (progressData.status === "completed") return { success: true, alreadyCompleted: true };
  const dueAtTs = progressData.dueAt?.toDate?.()?.getTime?.() ?? null;
  if (dueAtTs == null) return { success: false, error: "Invalid task timer" };

  if (Date.now() < dueAtTs) {
    return { success: false, error: "TimeAchieved is not complete yet" };
  }

  const gate = await canWorkerPerformFeeTasksServer(userId);
  if (!gate.ok) {
    return { success: false, error: "Account is not eligible to complete fee tasks" };
  }

  const task = taskDoc.data() || {};
  const platform = task.platform as string;
  const workerPrice = Number(task.workerPrice || 0);
  const campaign = task.campaign || {};
  const targetCountries = Array.isArray(campaign.targetCountries) ? campaign.targetCountries : [];

  const currentWorker = workerDoc.data() || {};
  const newBalance = Number(currentWorker.balance || 0) + workerPrice;

  const platformUpdates: Record<string, string> = {};
  if (platform && platform !== "free") {
    platformUpdates[platform] = "active";
  }

  const completedAt = new Date();

  // Mark task completed & credit balance.
  await workerRef.update({
    balance: newBalance,
    ...platformUpdates,
    // Always keep fee active when any work is completed.
    fee: "active",
    updatedAt: new Date(),
  });

  await progressRef.update({
    status: "completed",
    completedAt,
    updatedAt: new Date(),
  });

  const recordRef = db.collection(EARNING_RECORDS_COLLECTION).doc(`${userId}_${taskId}`);
  await recordRef.set(
    {
      userId,
      taskId,
      reward: workerPrice,
      completedAt,
      platform: platform || "free",
      adPrice: Number(task.adPrice ?? 0),
      workerPrice,
      socialMediaPrice: Number(task.socialMediaPrice ?? 0),
      mediaId: String(task.mediaId ?? ""),
      mediaType: String(task.mediaType ?? "image"),
      logoId: task.logoId ? String(task.logoId) : "",
      campaign: {
        totalViews: campaign.totalViews != null ? String(campaign.totalViews) : "",
        targetUsers: campaign.targetUsers != null ? String(campaign.targetUsers) : "",
        timeAchieved: campaign.timeAchieved != null ? String(campaign.timeAchieved) : "",
        targetCountries: targetCountries.map((c: Record<string, unknown>) => ({
          country: c.country != null ? String(c.country) : "",
          exactViews: c.exactViews != null ? String(c.exactViews) : "",
          percentage: typeof c.percentage === "number" ? c.percentage : Number(c.percentage ?? 0),
        })),
      },
      updatedAt: new Date(),
    },
    { merge: true }
  );

  return { success: true, reward: workerPrice };
}
