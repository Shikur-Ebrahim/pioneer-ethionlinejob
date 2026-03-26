"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase/client";
import { BottomNav } from "../_components/BottomNav";
import Image from "next/image";
import Link from "next/link";
import {
  Zap,
  Youtube,
  Instagram,
  Facebook,
  Globe,
  Loader2,
  Briefcase,
  ChevronRight,
  Users,
} from "lucide-react";

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

function TaskCard({ task }: { task: any }) {
  const platform = platformConfig[task.platform] ?? platformConfig["free"];
  const mediaUrl = task.mediaId ? getCloudinaryUrl(task.mediaId, task.mediaType) : null;
  const logoUrl = task.logoId ? getCloudinaryLogoUrl(task.logoId) : null;

  return (
    <div className="group relative bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 rounded-[2rem] overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
      {/* Gradient accent bar */}
      <div className={`h-1 w-full bg-gradient-to-r ${platform.gradient}`} />

      {/* Media */}
      <div className="relative w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900" style={{ aspectRatio: "16/9" }}>
        {mediaUrl ? (
          task.mediaType === "video" ? (
            <video
              src={mediaUrl}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            <Image
              src={mediaUrl}
              alt="Task"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
          )
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${platform.gradient} opacity-10`} />
        )}

        {/* Dark scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {/* Platform logo overlay */}
        <div className="absolute top-4 left-4">
          <div className="w-12 h-12 rounded-2xl bg-white/90 dark:bg-black/90 backdrop-blur-xl border border-white/20 dark:border-zinc-800/50 shadow-2xl flex items-center justify-center overflow-hidden p-2">
            {logoUrl ? (
              <Image src={logoUrl} alt="Platform Logo" width={40} height={40} className="object-contain" />
            ) : task.platform === "free" ? (
              <Image src="/logo.png" alt="Free Logo" width={40} height={40} className="object-contain" />
            ) : (
              <div className="text-zinc-400">{platform.icon}</div>
            )}
          </div>
        </div>

        {/* Worker pay pill */}
        <div className="absolute bottom-3 right-3">
          <div className="bg-emerald-500 text-zinc-950 font-black text-xs px-3 py-1.5 rounded-xl shadow-lg shadow-emerald-500/40 flex items-center gap-1">
            <Zap className="w-3 h-3" />
            +{task.workerPrice ?? "0"} Birr
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-4 space-y-4">
        {/* Pricing table */}
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-zinc-950">
            <span className="text-sm text-zinc-500 dark:text-zinc-400">Advertising Price</span>
            <span className="text-sm font-black text-zinc-900 dark:text-white">
              $ {task.adPrice != null ? Number(task.adPrice).toLocaleString() : "—"}
            </span>
          </div>
          <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-zinc-950">
            <span className="text-sm text-zinc-500 dark:text-zinc-400">For {platform.label}</span>
            <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
              $ {task.socialMediaPrice != null ? Number(task.socialMediaPrice).toLocaleString() : "—"}
            </span>
          </div>
          <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-zinc-950">
            <span className="text-sm text-zinc-500 dark:text-zinc-400">Your Earnings</span>
            <span className="text-sm font-black text-emerald-500">
              Birr {task.workerPrice != null ? Number(task.workerPrice).toLocaleString() : "—"}
            </span>
          </div>
        </div>

        {/* CTA */}
        <Link 
          href={`/user/work/${task.id}`}
          className={`w-full py-3.5 rounded-2xl bg-gradient-to-r ${platform.gradient} text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg hover:opacity-90 active:scale-95 transition-all`}
        >
          Start Task
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

export default function WorkPage() {
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(firebaseAuth, (u) => setUser(u));
  }, []);

  useEffect(() => {
    fetch("/api/tasks")
      .then((res) => res.json())
      .then((data) => setTasks(Array.isArray(data) ? data : []))
      .catch(() => setTasks([]))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-50 pb-28">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-zinc-50/90 dark:bg-black/90 backdrop-blur-xl border-b border-zinc-200/60 dark:border-zinc-800/60">
        <div className="max-w-lg mx-auto px-5 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-emerald-500" />
              Available Tasks
            </h1>
            {!isLoading && (
              <p className="text-[11px] text-zinc-400 font-medium mt-0.5">
                {tasks.length} task{tasks.length !== 1 ? "s" : ""} available
              </p>
            )}
          </div>
        </div>
      </div>

      <main className="max-w-lg mx-auto px-5 py-6 space-y-5">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="h-10 w-10 text-emerald-500 animate-spin mb-3" />
            <p className="text-sm font-bold text-zinc-500">Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 rounded-[2rem] border border-dashed border-zinc-200 dark:border-zinc-800">
            <Briefcase className="h-14 w-14 text-zinc-300 dark:text-zinc-700 mb-3" />
            <p className="text-base font-black text-zinc-500">No tasks right now</p>
            <p className="text-sm text-zinc-400 mt-1">Check back soon.</p>
          </div>
        ) : (
          tasks.map((task) => <TaskCard key={task.id} task={task} />)
        )}
      </main>

      <BottomNav />
    </div>
  );
}
