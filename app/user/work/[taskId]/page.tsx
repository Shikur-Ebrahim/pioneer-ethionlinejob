"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Zap,
  Youtube,
  Instagram,
  Facebook,
  Globe,
  Loader2,
  ChevronLeft,
  Target,
  ArrowRight,
  X,
} from "lucide-react";
import { getTaskServer } from "../../../admin/add-task/actions";
import { firebaseAuth } from "@/lib/firebase/client";
import { onAuthStateChanged } from "firebase/auth";
import { canWorkerPerformFeeTasksServer, checkWorkerStatusServer } from "../actions";
import { WorkerVerificationWizard } from "../../_components/WorkerVerificationWizard";

const platformConfig: Record<string, { label: string; icon: React.ReactNode; gradient: string; badge: string }> = {
  tiktok: {
    label: "TikTok",
    icon: <Zap className="w-4 h-4" />,
    gradient: "from-pink-500 via-rose-500 to-orange-400",
    badge: "bg-pink-500/15 text-pink-400 border-pink-500/25",
  },
  youtube: {
    label: "YouTube",
    icon: <Youtube className="w-4 h-4" />,
    gradient: "from-red-600 via-red-500 to-orange-500",
    badge: "bg-red-500/15 text-red-400 border-red-500/25",
  },
  facebook: {
    label: "Facebook",
    icon: <Facebook className="w-4 h-4" />,
    gradient: "from-blue-600 via-blue-500 to-indigo-500",
    badge: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  },
  instagram: {
    label: "Instagram",
    icon: <Instagram className="w-4 h-4" />,
    gradient: "from-purple-600 via-pink-500 to-orange-400",
    badge: "bg-purple-500/15 text-purple-400 border-purple-500/25",
  },
  free: {
    label: "Free",
    icon: <Globe className="w-4 h-4" />,
    gradient: "from-emerald-500 via-teal-500 to-cyan-500",
    badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  },
};

function getCloudinaryUrl(publicId: string, mediaType: string) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const resourceType = mediaType === "video" ? "video" : "image";
  return `https://res.cloudinary.com/${cloudName}/${resourceType}/upload/${publicId}`;
}

function getCloudinaryLogoUrl(publicId: string) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  return `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}`;
}

function VerifyQueryAutoOpen({
  isVerified,
  onRequestOpen,
}: {
  isVerified: boolean | null;
  onRequestOpen: () => void;
}) {
  const searchParams = useSearchParams();
  useEffect(() => {
    if (searchParams.get("verify") !== "1") return;
    if (isVerified !== false) return;
    onRequestOpen();
  }, [searchParams, isVerified, onRequestOpen]);
  return null;
}

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [task, setTask] = useState<any>(null);
  const [isTrackingOpen, setIsTrackingOpen] = useState(true);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [feeTaskGate, setFeeTaskGate] = useState<{ ok: boolean; reason?: string } | null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  const openVerificationModal = useCallback(() => setShowVerificationModal(true), []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
      if (user) {
        const verified = await checkWorkerStatusServer(user.uid);
        setIsVerified(verified);
        const gate = await canWorkerPerformFeeTasksServer(user.uid);
        setFeeTaskGate(gate);
      } else {
        setFeeTaskGate(null);
      }
    });

    if (params.taskId) {
      getTaskServer(params.taskId as string)
        .then((data) => {
          if (!data) {
            setTask({ error: "Task not found" });
          } else {
            setTask(data);
          }
        })
        .catch((err) => {
          console.error("Error fetching task:", err);
          setTask({ error: "Failed to load order details" });
        })
        .finally(() => setIsLoading(false));
    }

    return () => unsubscribe();
  }, [params.taskId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex flex-col items-center justify-center p-5">
        <Loader2 className="h-12 w-12 text-emerald-500 animate-spin mb-4" />
        <p className="text-sm font-bold text-zinc-500 animate-pulse">Initialising order...</p>
      </div>
    );
  }

  if (!task || task.error) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex flex-col items-center justify-center p-5">
        <div className="w-20 h-20 bg-rose-500/10 rounded-[2.5rem] flex items-center justify-center mb-6">
          <Target className="w-10 h-10 text-rose-500" />
        </div>
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white mb-2">Order Not Found</h1>
        <p className="text-sm text-zinc-400 mb-8 text-center max-w-xs">{task?.error || "The task you're looking for might have been completed or removed."}</p>
        <button
          onClick={() => router.push("/user/work")}
          className="flex items-center gap-2 px-8 py-4 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-black rounded-2xl font-black text-sm active:scale-95 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Tasks
        </button>
      </div>
    );
  }

  const platform = platformConfig[task.platform] ?? platformConfig["free"];
  const mediaUrl = task.mediaId ? getCloudinaryUrl(task.mediaId, task.mediaType) : null;
  const logoUrl = task.logoId ? getCloudinaryLogoUrl(task.logoId) : null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-50 pb-28">
      <Suspense fallback={null}>
        <VerifyQueryAutoOpen isVerified={isVerified} onRequestOpen={openVerificationModal} />
      </Suspense>
      {/* Header - Matching Image */}
      <div className="bg-[#1e7e4d] text-white">
        <div className="max-w-xl mx-auto px-5 py-4 flex items-center justify-between">
          <h1 className="text-lg font-bold">Commission Details</h1>
          <button onClick={() => router.back()} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      <main className="max-w-xl mx-auto px-5 py-6 space-y-6 bg-white dark:bg-zinc-950 min-h-screen">
        {feeTaskGate && !feeTaskGate.ok && feeTaskGate.reason === "fee_inactive" && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
            Your registration fee must be verified and <span className="font-black">active</span> before you can confirm
            this task. Please wait for admin approval.
          </div>
        )}
        {/* Item Profile Section */}
        <div className="flex gap-4 items-start pb-6 border-b border-zinc-100 dark:border-zinc-900">
          <div className="w-24 h-16 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 shrink-0 border border-zinc-200/50 dark:border-zinc-800 shadow-sm relative">
            {mediaUrl ? (
              task.mediaType === "video" ? (
                <video src={mediaUrl} className="w-full h-full object-cover" autoPlay muted loop playsInline />
              ) : (
                <Image src={mediaUrl} alt="Media" fill className="object-cover" />
              )
            ) : logoUrl ? (
              <Image src={logoUrl} alt="Logo" width={96} height={64} className="object-cover w-full h-full" />
            ) : (
              <div className={`w-full h-full bg-gradient-to-br ${platform.gradient}`} />
            )}
          </div>
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-[#1e7e4d]">{platform.label} Task</h2>
            <div className="flex items-center gap-1.5 mt-1 text-zinc-500">
              <span className="text-base">📍</span>
              <span className="text-xs font-medium">Click to earn!! Simple</span>
            </div>
          </div>
        </div>

        {/* Mid Section - Timing & Stats with Icons */}
        <div className="space-y-6 pt-2 pb-4">
          {/* Row 1: Simple Style Reversion */}
          <div className="grid grid-cols-2 gap-x-8">
            <div className="space-y-1">
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Pay in full</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-zinc-500 font-medium whitespace-nowrap">Time to complete by:</p>
              <p className="text-sm text-zinc-500 font-medium">{task.campaign?.timeAchieved || "—"}</p>
            </div>
          </div>

          {/* Row 2: simple Style Reversion */}
          <div className="grid grid-cols-2 gap-x-8 border-t border-zinc-50 dark:border-zinc-900 pt-4">
            <div className="flex flex-col">
              <span className="text-sm text-zinc-500 font-medium whitespace-nowrap">Target Views</span>
              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{task.campaign?.totalViews || "—"}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-zinc-500 font-medium whitespace-nowrap">Target Workers</span>
              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{task.campaign?.targetUsers || "—"}</span>
            </div>
          </div>
        </div>

        {/* Order Number Row */}
        <div className="flex items-center justify-between py-2 border-t border-zinc-50 dark:border-zinc-900 pt-4">
          <span className="text-sm text-zinc-900 dark:text-zinc-100 font-medium">Order number:</span>
          <span className="text-sm font-bold text-[#1e7e4d] break-all max-w-[180px]">{task.id || params.taskId}</span>
        </div>

        {/* Stats Card (Gray Box) */}
        <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-2xl space-y-5">
          <div className="flex items-center justify-between text-zinc-700 dark:text-zinc-300">
            <span className="text-sm">Advertising Price</span>
            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase">$ {task.adPrice?.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-zinc-700 dark:text-zinc-300">
            <span className="text-sm">For {platform.label}</span>
            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">$ {(task.socialMediaPrice || 0).toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between border-t border-zinc-200/50 dark:border-zinc-800/50 pt-5">
            <span className="text-sm text-zinc-700 dark:text-zinc-300">Your Earnings</span>
            <span className="text-sm font-bold text-[#1e7e4d] uppercase">ETB {task.workerPrice?.toLocaleString()}</span>
          </div>
        </div>

        {/* Footer Info & Buttons */}
        <div className="pt-8 space-y-8 pb-20">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-sm">Amount to pay:</span>
            <span className="text-sm font-bold text-zinc-900 dark:text-white">ETB {task.workerPrice?.toLocaleString() || "0"}</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (feeTaskGate?.ok) {
                  router.push(`/user/work/${params.taskId}/start`);
                  return;
                }
                if (feeTaskGate?.reason === "fee_inactive") {
                  return;
                }
                if (feeTaskGate?.reason === "not_verified" || isVerified === false) {
                  setShowVerificationModal(true);
                  return;
                }
                setShowVerificationModal(true);
              }}
              disabled={feeTaskGate?.reason === "fee_inactive" || feeTaskGate === null}
              className="flex-1 h-14 rounded-xl bg-[#1e7e4d] text-white font-bold text-base shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {feeTaskGate === null ? "Loading…" : feeTaskGate.ok ? "Start task" : "Confirm & verify"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>

      {showVerificationModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
          <div className="w-full max-w-xl bg-white dark:bg-zinc-950 rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
            <WorkerVerificationWizard
              variant="modal"
              onClose={() => setShowVerificationModal(false)}
              successHref="/user/work"
            />
          </div>
        </div>
      )}
    </div>
  );
}
