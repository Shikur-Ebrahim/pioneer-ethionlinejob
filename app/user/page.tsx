"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase/client";
import { BottomNav } from "./_components/BottomNav";
import { getHomeVideosServer } from "../admin/home-video/actions";
import {
  getWelcomePromptStateServer,
  recordWelcomePromptShownServer,
  type WelcomePromptState,
} from "./welcome-prompt/actions";
import { getWorkerHomeSnapshotServer } from "./work/actions";
import {
  Play,
  Loader2,
  Wallet,
  ArrowUpRight,
  Clapperboard,
  Briefcase,
  PlayCircle,
  HelpCircle,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Banknote,
} from "lucide-react";

function getOrCreateWelcomeTabSessionId(): string {
  if (typeof window === "undefined") return "";
  const k = "pioneer_welcome_tab_session_v1";
  let id = sessionStorage.getItem(k);
  if (!id) {
    id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}_${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(k, id);
  }
  return id;
}

export default function UserHomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [homeVideo, setHomeVideo] = useState<any | null>(null);
  const [isLoadingVideo, setIsLoadingVideo] = useState(true);
  const [showWelcomeCard, setShowWelcomeCard] = useState(false);
  const [welcomePrompt, setWelcomePrompt] = useState<WelcomePromptState | null>(null);
  const [balanceDisplay, setBalanceDisplay] = useState<number | null>(null);

  useEffect(() => {
    onAuthStateChanged(firebaseAuth, (u) => setUser(u));
    loadHomeVideo();
  }, []);

  useEffect(() => {
    if (!user?.uid) {
      setShowWelcomeCard(false);
      setWelcomePrompt(null);
      return;
    }
    let cancelled = false;
    const uid = user.uid;
    const tabSessionId = getOrCreateWelcomeTabSessionId();
    const uiDoneKey = `pioneer_welcome_ui_done_v1:${uid}`;

    (async () => {
      const state = await getWelcomePromptStateServer(uid);
      if (cancelled) return;

      if (
        !state.needsApplication ||
        state.maxDisplayCount <= 0 ||
        state.shownCount >= state.maxDisplayCount
      ) {
        setWelcomePrompt(state);
        setShowWelcomeCard(false);
        return;
      }

      if (typeof window !== "undefined" && sessionStorage.getItem(uiDoneKey) === tabSessionId) {
        setWelcomePrompt(state);
        setShowWelcomeCard(false);
        return;
      }

      await recordWelcomePromptShownServer(uid, tabSessionId);
      if (cancelled) return;
      setWelcomePrompt(state);
      setShowWelcomeCard(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) {
      setBalanceDisplay(null);
      return;
    }
    let cancelled = false;
    (async () => {
      const snap = await getWorkerHomeSnapshotServer(user.uid);
      if (cancelled) return;
      setBalanceDisplay(snap.balance);
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  useEffect(() => {
    if (!showWelcomeCard || !user?.uid) return;
    const tabSessionId = getOrCreateWelcomeTabSessionId();
    const uiDoneKey = `pioneer_welcome_ui_done_v1:${user.uid}`;
    if (typeof window !== "undefined" && tabSessionId) {
      sessionStorage.setItem(uiDoneKey, tabSessionId);
    }
  }, [showWelcomeCard, user?.uid]);

  const loadHomeVideo = async () => {
    try {
      const videos = await getHomeVideosServer();
      if (videos.length > 0) {
        setHomeVideo(videos[0]);
      }
    } catch (error) {
      console.error("Failed to load home video:", error);
    } finally {
      setIsLoadingVideo(false);
    }
  };
 
 
  const dismissWelcome = () => {
    setShowWelcomeCard(false);
    if (user?.uid && typeof window !== "undefined") {
      const tabSessionId = getOrCreateWelcomeTabSessionId();
      if (tabSessionId) {
        sessionStorage.setItem(`pioneer_welcome_ui_done_v1:${user.uid}`, tabSessionId);
      }
    }
  };

  const goApplyForWork = () => {
    dismissWelcome();
    router.push("/user/worker-verification");
  };

  const workerFeeWelcome = welcomePrompt?.workerFee ?? 100;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50 pb-20">
      {showWelcomeCard && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="welcome-apply-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-zinc-950/70 backdrop-blur-md"
            aria-label="Dismiss"
            onClick={dismissWelcome}
          />
          <div className="relative w-full max-w-md sm:max-w-lg animate-in slide-in-from-bottom duration-300 fade-in">
            <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-emerald-400/30 blur-3xl dark:bg-emerald-500/20" />
            <div className="pointer-events-none absolute -bottom-16 right-0 h-40 w-40 rounded-full bg-blue-500/25 blur-3xl dark:bg-blue-400/15" />

            <div className="relative overflow-hidden rounded-t-[2rem] border border-white/20 bg-gradient-to-b from-white via-white to-emerald-50/90 shadow-2xl dark:from-zinc-900 dark:via-zinc-950 dark:to-emerald-950/40 dark:border-zinc-700/80 sm:rounded-[2rem] sm:border-zinc-200/80">
              <div className="absolute left-0 right-0 top-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-500" />

              <div className="px-6 pb-8 pt-7 sm:px-8 sm:pb-10 sm:pt-9">
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-600/30 ring-4 ring-emerald-500/10">
                      <ShieldCheck className="h-7 w-7" strokeWidth={2.2} />
                    </div>
                    <div>
                      <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
                        <Sparkles className="h-3 w-3" />
                        New here
                      </p>
                      <h2
                        id="welcome-apply-title"
                        className="mt-1 text-xl font-black leading-tight tracking-tight text-zinc-900 dark:text-white sm:text-2xl"
                      >
                        Become a verified worker
                      </h2>
                    </div>
                  </div>
                </div>

                <p className="text-sm font-medium leading-relaxed text-zinc-600 dark:text-zinc-300">
                  Complete a quick one-time verification to unlock tasks and start earning. It only takes a few minutes.
                </p>

                <div className="mt-5 flex items-center gap-3 rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50 to-orange-50 p-4 dark:border-amber-500/25 dark:from-amber-500/10 dark:to-orange-500/10">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm dark:bg-zinc-900 dark:text-amber-400">
                    <Banknote className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-amber-800/80 dark:text-amber-200/90">
                      Worker starting fee (one-time)
                    </p>
                    <p className="text-lg font-black text-amber-950 dark:text-amber-100">
                      ETB {workerFeeWelcome.toLocaleString()}
                    </p>
                    <p className="text-[11px] font-medium text-amber-900/70 dark:text-amber-200/70">
                      From official payment methods — paid once when you apply.
                    </p>
                  </div>
                </div>

                <ul className="mt-5 space-y-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  <li className="flex items-center gap-2.5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                      ✓
                    </span>
                    Secure ID check &amp; payment proof
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-blue-700 dark:text-blue-400">
                      ✓
                    </span>
                    Access all available tasks after approval
                  </li>
                </ul>

                <div className="mt-8 flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={goApplyForWork}
                    className="group flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-[15px] font-black text-white shadow-xl shadow-emerald-600/25 transition active:scale-[0.98] hover:from-emerald-500 hover:to-teal-500"
                  >
                    Apply for work now
                    <ChevronRight className="h-5 w-5 transition group-hover:translate-x-0.5" />
                  </button>
                  <button
                    type="button"
                    onClick={dismissWelcome}
                    className="h-12 w-full rounded-2xl text-sm font-bold text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800 active:scale-[0.99] dark:text-zinc-400 dark:hover:bg-zinc-800/80 dark:hover:text-zinc-200"
                  >
                    Later
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="mx-auto flex flex-col max-w-3xl px-1 pt-1 pb-8">
        {/* Home Video Section - Modular Landing Page Style */}
        <div className="mb-3 px-0">
          <div className="group relative aspect-video w-full overflow-hidden bg-zinc-900 rounded-2xl shadow-2xl ring-1 ring-zinc-200 dark:ring-zinc-800 transition-all hover:shadow-emerald-500/10 active:scale-[0.99]">
            {isLoadingVideo ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
              </div>
            ) : homeVideo ? (
              <>
                <video
                  src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload/${homeVideo.imageId}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  autoPlay
                  muted
                  loop
                  playsInline
                  controls
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-zinc-50 dark:bg-zinc-950">
                <div className="w-16 h-16 rounded-2xl bg-white dark:bg-zinc-900 flex items-center justify-center mb-4 border border-zinc-100 dark:border-zinc-800 shadow-lg ring-1 ring-black/5">
                  <Play className="w-8 h-8 text-emerald-600 fill-emerald-600" />
                </div>
                <p className="text-sm font-black text-zinc-900 dark:text-white tracking-tight">Pioneer Online Job</p>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Ready to work</p>
              </div>
            )}
          </div>
        </div>

        {/* Dashboard Balance Card - New Premium Style */}
        <div className="px-0 mb-3">
          <div className="rounded-[2.5rem] bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/60 shadow-2xl p-8 relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <div className="flex flex-col gap-1">
                <div className="h-14 w-14 bg-blue-50 dark:bg-blue-900/20 rounded-[1.25rem] flex items-center justify-center text-blue-600 mb-4 border border-blue-100 dark:border-blue-900/30">
                  <Wallet className="h-7 w-7" />
                </div>
                <span className="text-zinc-500 dark:text-zinc-400 text-sm font-bold tracking-tight">Current Balance</span>
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter leading-none">
                    {!user
                      ? "ETB 0.00"
                      : balanceDisplay === null
                        ? (
                            <>
                              ETB{" "}
                              <span className="inline-block h-8 w-24 animate-pulse rounded-lg bg-zinc-200 align-bottom dark:bg-zinc-800" />
                            </>
                          )
                        : `ETB ${balanceDisplay.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}`}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <Link
                href="/user/work"
                className="flex items-center justify-center gap-2 py-4 px-6 rounded-2xl border-2 border-blue-100 dark:border-blue-900/30 text-blue-600 font-black text-sm transition-all hover:bg-blue-50 dark:hover:bg-blue-900/10 active:scale-95 shadow-sm"
              >
                <Briefcase className="h-4 w-4" />
                Start Work
              </Link>
              <Link
                href="/user/wallet/withdraw"
                className="flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-blue-600 text-white font-black text-sm transition-all hover:bg-blue-500 active:scale-95 shadow-lg shadow-blue-500/30"
              >
                <ArrowUpRight className="h-4 w-4" />
                Withdraw
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions Header */}
        <div className="px-4 mb-3 flex items-center justify-between">
          <h2 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight">Quick Actions</h2>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Active Now</span>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="px-0 grid grid-cols-3 gap-3 mb-8">
          <Link
            href="/user/how-to-work"
            className="flex flex-col items-center justify-center gap-3 p-6 rounded-[2rem] bg-blue-600 text-white shadow-xl shadow-blue-500/20 transition-all hover:-translate-y-1 active:scale-95 group"
          >
            <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform">
              <PlayCircle className="h-6 w-6" />
            </div>
            <span className="text-[11px] font-black tracking-tight whitespace-nowrap">How to Work</span>
          </Link>

          <Link
            href="/user/worker"
            className="flex flex-col items-center justify-center gap-3 p-6 rounded-[2rem] bg-emerald-600 text-white shadow-xl shadow-emerald-500/20 transition-all hover:-translate-y-1 active:scale-95 group"
          >
            <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform">
              <Clapperboard className="h-6 w-6" />
            </div>
            <span className="text-[11px] font-black tracking-tight">Worker</span>
          </Link>

          <Link
            href="/user/support"
            className="flex flex-col items-center justify-center gap-3 p-6 rounded-[2rem] bg-[#FFC107] text-white shadow-xl shadow-[#FFC107]/20 transition-all hover:-translate-y-1 active:scale-95 group"
          >
            <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform">
              <HelpCircle className="h-6 w-6" />
            </div>
            <span className="text-[11px] font-black tracking-tight">Get Support</span>
          </Link>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}

