"use client";
 
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase/client";
import { BottomNav } from "./_components/BottomNav";
import { getHomeVideosServer } from "../admin/home-video/actions";
import { Play, Loader2, Wallet, Plus, ArrowUpRight, ShoppingCart, Clapperboard, UserPlus, Briefcase, PlayCircle, HelpCircle } from "lucide-react";
 
export default function UserHomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [homeVideo, setHomeVideo] = useState<any | null>(null);
  const [isLoadingVideo, setIsLoadingVideo] = useState(true);
 
  useEffect(() => {
    onAuthStateChanged(firebaseAuth, (u) => setUser(u));
    loadHomeVideo();
  }, []);

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
 
 
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50 pb-20">
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
                  <span className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter leading-none">ETB 0.00</span>
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

