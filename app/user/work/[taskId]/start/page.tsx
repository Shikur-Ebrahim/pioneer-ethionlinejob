"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Globe,
  Loader2,
  MapPin,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { getTaskServer } from "@/app/admin/add-task/actions";
import { firebaseAuth } from "@/lib/firebase/client";
import { onAuthStateChanged } from "firebase/auth";
import {
  canWorkerPerformFeeTasksServer,
  completeWorkerTaskServer,
  getWorkerTaskProgressServer,
  startWorkerTaskServer,
} from "../../actions";
import { BottomNav } from "@/app/user/_components/BottomNav";

function getCloudinaryUrl(publicId: string, mediaType: string) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const resourceType = mediaType === "video" ? "video" : "image";
  return `https://res.cloudinary.com/${cloudName}/${resourceType}/upload/${publicId}`;
}

type CountryRow = { country?: string; exactViews?: string; percentage?: number };

export default function TaskStartPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.taskId as string;

  const [uid, setUid] = useState<string | null>(null);
  const [task, setTask] = useState<any>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [gateOk, setGateOk] = useState<boolean | null>(null);
  const [gateReason, setGateReason] = useState<string | null>(null);
  const [progress, setProgress] = useState<{
    status: string;
    dueAt: string | null;
    completedAt: string | null;
    startedAt: string | null;
  } | null>(null);
  const [starting, setStarting] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [completeMsg, setCompleteMsg] = useState<string | null>(null);

  useEffect(() => {
    return onAuthStateChanged(firebaseAuth, (u) => {
      setUid(u?.uid ?? null);
      if (!u) router.replace("/auth/login");
    });
  }, [router]);

  useEffect(() => {
    if (!taskId) return;
    getTaskServer(taskId)
      .then((data) => {
        if (!data) setLoadError("Task not found");
        else setTask(data);
      })
      .catch(() => setLoadError("Failed to load task"));
  }, [taskId]);

  const refreshProgress = useCallback(async () => {
    if (!uid || !taskId) return;
    const p = await getWorkerTaskProgressServer(uid, taskId);
    if (!p || !("status" in p)) return;
    if (p.status === "not_started") {
      setProgress(null);
      return;
    }
    setProgress({
      status: p.status,
      dueAt: p.dueAt ?? null,
      completedAt: p.completedAt ?? null,
      startedAt: p.startedAt ?? null,
    });
  }, [uid, taskId]);

  useEffect(() => {
    if (!uid || !taskId) return;
    let cancelled = false;
    (async () => {
      const gate = await canWorkerPerformFeeTasksServer(uid);
      if (cancelled) return;
      setGateOk(gate.ok);
      setGateReason(gate.reason ?? null);
      if (!gate.ok) return;

      const p = await getWorkerTaskProgressServer(uid, taskId);
      if (cancelled) return;
      if (p && "status" in p && p.status === "not_started") {
        setStarting(true);
        const res = await startWorkerTaskServer(uid, taskId);
        setStarting(false);
        if (!res.success) {
          setLoadError(res.error || "Could not start task");
          return;
        }
      }
      await refreshProgress();
    })();
    return () => {
      cancelled = true;
    };
  }, [uid, taskId, refreshProgress]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const dueMs = progress?.dueAt ? new Date(progress.dueAt).getTime() : null;
  const remainingMs = dueMs != null ? Math.max(0, dueMs - now) : null;
  const canComplete =
    progress?.status === "working" && dueMs != null && now >= dueMs && gateOk === true;

  const countries: CountryRow[] = useMemo(() => {
    const raw = task?.campaign?.targetCountries;
    return Array.isArray(raw) ? raw : [];
  }, [task]);

  async function onComplete() {
    if (!uid) return;
    setCompleteMsg(null);
    setCompleting(true);
    const res = await completeWorkerTaskServer(uid, taskId);
    setCompleting(false);
    if (res.success) {
      setCompleteMsg(`+${res.reward ?? 0} ETB added to your balance`);
      await refreshProgress();
    } else {
      setCompleteMsg(res.error || "Could not complete");
    }
  }

  if (!uid) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (gateOk === null) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-zinc-50 dark:bg-black">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
        <p className="text-xs font-bold text-zinc-500">Checking your account…</p>
      </div>
    );
  }

  if (gateOk === false) {
    return (
      <div className="min-h-screen bg-zinc-50 pb-24 dark:bg-black">
        <main className="mx-auto max-w-lg px-4 py-10">
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-500/30 dark:bg-amber-950/40">
            <h1 className="text-lg font-black text-zinc-900 dark:text-white">Task not available</h1>
            <p className="mt-2 text-sm font-medium text-amber-900/90 dark:text-amber-200/90">
              {gateReason === "fee_inactive" &&
                "Your registration fee must be verified and active by admin before you can run paid tasks."}
              {gateReason === "not_verified" && "Complete worker verification and wait for admin approval first."}
              {gateReason === "no_worker" && "Create your worker profile through verification first."}
            </p>
            <Link
              href="/user/work"
              className="mt-5 flex h-12 items-center justify-center rounded-2xl bg-zinc-900 text-sm font-black text-white dark:bg-white dark:text-black"
            >
              Back to tasks
            </Link>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  if (loadError || !task) {
    return (
      <div className="min-h-screen bg-zinc-50 pb-24 dark:bg-black">
        <main className="mx-auto max-w-lg px-4 py-10 text-center">
          <p className="text-sm font-bold text-rose-600">{loadError || "Loading…"}</p>
          <Link href="/user/work" className="mt-4 inline-block text-emerald-600 font-bold">
            Back
          </Link>
        </main>
        <BottomNav />
      </div>
    );
  }

  if (gateOk && progress === null && !starting) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-zinc-50 dark:bg-black">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
        <p className="text-xs font-bold text-zinc-500">Preparing your task…</p>
        <BottomNav />
      </div>
    );
  }

  const mediaUrl = task.mediaId ? getCloudinaryUrl(task.mediaId, task.mediaType || "image") : null;
  const isVideo = task.mediaType === "video";

  if (progress?.status === "completed") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white pb-28 dark:from-emerald-950/30 dark:to-zinc-950">
        <main className="mx-auto max-w-lg px-4 pt-6">
          <div className="rounded-[2rem] border border-emerald-200 bg-white p-8 text-center shadow-xl dark:border-emerald-500/20 dark:bg-zinc-900">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-500/20">
              <CheckCircle2 className="h-9 w-9 text-emerald-600" />
            </div>
            <h1 className="text-xl font-black text-zinc-900 dark:text-white">Task finished</h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Reward is in your wallet. View details in Records.</p>
            <Link
              href="/user/record"
              className="mt-6 flex h-14 items-center justify-center rounded-2xl bg-emerald-600 text-sm font-black text-white"
            >
              View earning record
            </Link>
            <Link
              href="/user/work"
              className="mt-3 block text-center text-sm font-bold text-emerald-700 dark:text-emerald-400"
            >
              More tasks
            </Link>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-100 to-white pb-28 dark:from-zinc-950 dark:to-black">
      <header className="sticky top-0 z-20 border-b border-zinc-200/80 bg-white/90 px-4 py-4 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/90">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <Link href={`/user/work/${taskId}`} className="text-sm font-bold text-emerald-600">
            ← Order
          </Link>
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Live task</span>
        </div>
      </header>

      <main className="mx-auto max-w-lg space-y-5 px-4 pt-5">
        <div className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
          <div className="relative aspect-video w-full bg-zinc-100 dark:bg-zinc-800">
            {mediaUrl ? (
              isVideo ? (
                <video src={mediaUrl} className="h-full w-full object-cover" autoPlay muted loop playsInline />
              ) : (
                <Image src={mediaUrl} alt="" fill className="object-cover" sizes="100vw" priority />
              )
            ) : (
              <div className="flex h-full items-center justify-center text-zinc-400">No media</div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
              <span className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-black uppercase text-zinc-900 dark:bg-black/80 dark:text-white">
                {task.platform || "free"} · Advertising
              </span>
              <span className="rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-black text-white">
                ETB {Number(task.workerPrice ?? 0).toLocaleString()} reward
              </span>
            </div>
          </div>

          <div className="space-y-4 p-5">
            <div className="flex flex-wrap gap-2">
              <StatChip icon={<TrendingUp className="h-3.5 w-3.5" />} label="Ad price" value={`$ ${Number(task.adPrice ?? 0).toLocaleString()}`} />
              <StatChip icon={<Zap className="h-3.5 w-3.5" />} label="Social" value={`$ ${Number(task.socialMediaPrice ?? 0).toLocaleString()}`} />
              <StatChip icon={<Users className="h-3.5 w-3.5" />} label="Workers" value={String(task.campaign?.targetUsers ?? "—")} />
            </div>

            <div>
              <p className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-zinc-400">
                <Globe className="h-4 w-4" /> Target countries & views
              </p>
              <div className="space-y-2">
                {countries.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-zinc-200 px-3 py-4 text-center text-xs text-zinc-500 dark:border-zinc-700">
                    No country breakdown for this campaign.
                  </p>
                ) : (
                  countries.map((c, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-100 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-800/50"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <MapPin className="h-4 w-4 shrink-0 text-emerald-600" />
                        <span className="truncate text-sm font-black text-zinc-900 dark:text-white">{c.country ?? "—"}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-zinc-500">{c.exactViews ?? ""}</p>
                        {c.percentage != null && (
                          <p className="text-xs font-black text-emerald-600">{c.percentage}% share</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/40">
                <p className="text-[10px] font-bold uppercase text-zinc-400">Total views</p>
                <p className="mt-1 text-sm font-black text-zinc-900 dark:text-white">{task.campaign?.totalViews ?? "—"}</p>
              </div>
              <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/40">
                <p className="text-[10px] font-bold uppercase text-zinc-400">Time</p>
                <p className="mt-1 text-sm font-black text-zinc-900 dark:text-white">{task.campaign?.timeAchieved ?? "—"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 dark:border-emerald-500/30 dark:from-emerald-950/40 dark:to-zinc-900">
          {starting ? (
            <div className="flex flex-col items-center py-6">
              <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
              <p className="mt-3 text-sm font-bold text-zinc-600 dark:text-zinc-400">Starting timer…</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center gap-2 text-emerald-700 dark:text-emerald-300">
                <Clock className="h-6 w-6" />
                <span className="text-sm font-black uppercase tracking-widest">Timer</span>
              </div>
              <p className="mt-4 text-center text-4xl font-black tabular-nums text-zinc-900 dark:text-white">
                {remainingMs == null ? "—" : formatCountdown(remainingMs)}
              </p>
              <p className="mt-2 text-center text-xs font-medium text-zinc-500">
                {canComplete ? "Time is up — confirm to add reward to your balance" : "Wait until the timer ends, then confirm"}
              </p>
              <button
                type="button"
                disabled={!canComplete || completing}
                onClick={onComplete}
                className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 text-[15px] font-black text-white shadow-lg shadow-emerald-600/30 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {completing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Target className="h-5 w-5" />}
                Confirm & add reward
                <ArrowRight className="h-4 w-4" />
              </button>
              {completeMsg && (
                <p className={`mt-3 text-center text-sm font-bold ${completeMsg.includes("ETB") ? "text-emerald-600" : "text-rose-600"}`}>
                  {completeMsg}
                </p>
              )}
            </>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}

function StatChip({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-zinc-100 bg-zinc-50 px-3 py-2 text-xs dark:border-zinc-800 dark:bg-zinc-800/50">
      <span className="text-emerald-600">{icon}</span>
      <div>
        <p className="text-[9px] font-bold uppercase text-zinc-400">{label}</p>
        <p className="font-black text-zinc-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}

function formatCountdown(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}
