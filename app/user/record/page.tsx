"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { onAuthStateChanged, type User } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase/client";
import { BottomNav } from "../_components/BottomNav";
import { getEarningRecordsServer, type EarningRecordListItem } from "@/app/user/work/actions";
import { getCloudinaryUrl } from "@/lib/cloudinary";

function formatCompletedAt(iso: string | null): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "—";
  }
}

export default function RecordPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [records, setRecords] = useState<EarningRecordListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(firebaseAuth, (u) => {
      setUser(u);
      setAuthReady(true);
    });
  }, []);

  useEffect(() => {
    if (!authReady) return;
    if (!user?.uid) {
      setRecords([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const rows = await getEarningRecordsServer(user.uid);
      if (cancelled) return;
      setRecords(rows);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [authReady, user?.uid]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 via-white to-zinc-100 pb-24 dark:from-black dark:via-zinc-950 dark:to-black">
      <header className="sticky top-0 z-10 border-b border-zinc-200/80 bg-white/90 backdrop-blur-md dark:border-zinc-800 dark:bg-black/80">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <Link
            href="/user/profile"
            className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
            aria-label="Back"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-lg font-black tracking-tight text-zinc-900 dark:text-white">Earning records</h1>
          <span className="w-10" />
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">
        <p className="mb-6 text-center text-xs font-medium leading-relaxed text-zinc-500 dark:text-zinc-400">
          Completed fee tasks with full campaign details. Rewards are credited to your balance when you confirm.
        </p>

        {!authReady && (
          <div className="flex flex-col items-center justify-center gap-3 py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
            <p className="text-xs font-bold text-zinc-500">Checking session…</p>
          </div>
        )}

        {authReady && !user?.uid && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-sm font-bold text-zinc-600 dark:text-zinc-400">Sign in to see your records.</p>
          </div>
        )}

        {authReady && user?.uid && loading && (
          <div className="flex flex-col items-center justify-center gap-3 py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
            <p className="text-xs font-bold text-zinc-500">Loading records…</p>
          </div>
        )}

        {authReady && user?.uid && !loading && records.length === 0 && (
          <div className="rounded-3xl border border-dashed border-zinc-300 bg-white/80 p-10 text-center dark:border-zinc-700 dark:bg-zinc-950/80">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-3xl">
              📋
            </div>
            <p className="text-base font-black text-zinc-900 dark:text-white">No records yet</p>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Complete a fee task from Work — your campaigns will appear here with full details.
            </p>
            <Link
              href="/user/work"
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#1e7e4d] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/20"
            >
              Go to Work
            </Link>
          </div>
        )}

        {authReady && user?.uid && !loading && records.length > 0 && (
          <ul className="flex flex-col gap-5">
            {records.map((r) => {
              const mediaUrl = r.mediaId ? getCloudinaryUrl(r.mediaId, r.mediaType || "image") : null;
              const countries = r.campaign?.targetCountries ?? [];
              return (
                <li
                  key={r.id}
                  className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-xl shadow-zinc-200/50 dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-black/40"
                >
                  <div className="relative aspect-[21/9] w-full bg-zinc-100 dark:bg-zinc-900">
                    {mediaUrl ? (
                      <Image
                        src={mediaUrl}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="(max-width: 512px) 100vw, 512px"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-4xl opacity-40">📢</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-end justify-between gap-2">
                      <span className="rounded-full bg-white/95 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-zinc-900 shadow dark:bg-zinc-900/95 dark:text-white">
                        {r.platform || "free"}
                      </span>
                      <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-black text-white shadow-lg">
                        +{r.reward} ETB
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4 p-4">
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-lg bg-zinc-100 px-2.5 py-1 text-[11px] font-bold text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                        Ad {r.adPrice?.toLocaleString() ?? "—"} ETB
                      </span>
                      <span className="rounded-lg bg-emerald-500/15 px-2.5 py-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                        Worker {r.workerPrice ?? "—"} ETB
                      </span>
                      <span className="rounded-lg bg-amber-500/15 px-2.5 py-1 text-[11px] font-bold text-amber-900 dark:text-amber-200">
                        Social {r.socialMediaPrice ?? "—"} ETB
                      </span>
                    </div>

                    {r.campaign?.totalViews && (
                      <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                        Total reach: <span className="text-emerald-600 dark:text-emerald-400">{r.campaign.totalViews}</span>
                        {r.campaign.targetUsers ? (
                          <span className="text-zinc-500 dark:text-zinc-400">
                            {" "}
                            · Target users {r.campaign.targetUsers}
                          </span>
                        ) : null}
                      </p>
                    )}

                    {countries.length > 0 && (
                      <div>
                        <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                          Target countries
                        </p>
                        <div className="space-y-2">
                          {countries.map((c, i) => (
                            <div
                              key={`${r.id}-c-${i}`}
                              className="flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50/80 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900/50"
                            >
                              <span className="text-sm font-bold text-zinc-900 dark:text-white">{c.country}</span>
                              <div className="text-right">
                                <p className="text-xs font-bold text-zinc-600 dark:text-zinc-300">{c.exactViews}</p>
                                <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                  {c.percentage}%
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between border-t border-zinc-100 pt-3 text-xs dark:border-zinc-800">
                      <span className="font-bold text-zinc-500 dark:text-zinc-400">
                        Completed {formatCompletedAt(r.completedAt)}
                      </span>
                      <span className="max-w-[40%] truncate font-mono text-[10px] text-zinc-400" title={r.taskId}>
                        {r.taskId.slice(0, 12)}…
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
