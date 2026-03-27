"use client";

import { useEffect, useMemo, useState } from "react";
import { BottomNav } from "../_components/BottomNav";
import { getWorkerVideosServer } from "@/app/admin/worker-video/actions";
import { Clapperboard, Loader2 } from "lucide-react";

type WorkerVideo = {
  id: string;
  imageId: string;
  createdAt?: string | null;
};

export default function WorkerPage() {
  const [videos, setVideos] = useState<WorkerVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  useEffect(() => {
    const loadVideos = async () => {
      setIsLoading(true);
      try {
        const rows = (await getWorkerVideosServer()) as WorkerVideo[];
        setVideos(rows || []);
      } catch (error) {
        console.error("Failed to load worker videos:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadVideos();
  }, []);

  const items = useMemo(() => {
    return videos.map((video) => ({
      ...video,
      src: `https://res.cloudinary.com/${cloudName}/video/upload/${video.imageId}`,
    }));
  }, [videos, cloudName]);

  return (
    <div className="min-h-screen bg-zinc-50 pb-20 text-zinc-900 dark:bg-black dark:text-zinc-50">
      <main className="mx-auto flex w-full max-w-3xl flex-col px-3 py-4">
        <div className="mb-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h1 className="text-xl font-black tracking-tight">Worker Videos</h1>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Watch all worker videos. Tap play and use full controls like social media reels.
          </p>
        </div>

        {isLoading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-zinc-300 bg-white p-8 text-center dark:border-zinc-700 dark:bg-zinc-950">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
              <Clapperboard className="h-7 w-7" />
            </div>
            <p className="text-sm font-bold">No worker videos yet</p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Admin can add videos from the Worker Video page.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {items.map((video, index) => (
              <article
                key={video.id}
                className="overflow-hidden rounded-[1.75rem] border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
                  <p className="text-xs font-bold text-zinc-700 dark:text-zinc-200">Sample Worker Video</p>
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400">
                    Live
                  </span>
                </div>
                <div className="relative aspect-[9/16] w-full bg-black sm:aspect-video">
                  <video
                    src={video.src}
                    className="h-full w-full object-cover"
                    controls
                    playsInline
                    preload="metadata"
                  />
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
