"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase/client";
import { BottomNav } from "../_components/BottomNav";
import { getWorkerHomeSnapshotServer } from "../work/actions";
import {
  getWorkerProfileRecordServer,
  updateWorkerFullNameServer,
  type WorkerProfileRecord,
} from "./actions";
import {
  Building2,
  ChevronRight,
  FileText,
  Fingerprint,
  KeyRound,
  Loader2,
  LogOut,
  Pencil,
  Save,
  Settings,
} from "lucide-react";

type Panel = "menu" | "bank" | "applications" | "settings";

function cloudinaryImageUrl(publicId: string) {
  const c = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!c || !publicId) return "";
  return `https://res.cloudinary.com/${c}/image/upload/${publicId}`;
}

function formatIdType(raw: string) {
  if (!raw) return "—";
  return raw
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function StatusPill({ value, label }: { value: string; label: string }) {
  const active = value === "active";
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-zinc-100 bg-zinc-50/80 px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-900/50">
      <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">{label}</span>
      <span
        className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide ${
          active
            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
            : "bg-zinc-200/80 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
        }`}
      >
        {value || "—"}
      </span>
    </div>
  );
}

function AccountStatusBanner({ status }: { status: string }) {
  const s = status.toLowerCase();
  const map: Record<string, { bg: string; text: string; label: string }> = {
    verified: {
      bg: "bg-emerald-500/15 border-emerald-500/25",
      text: "text-emerald-800 dark:text-emerald-300",
      label: "Verified worker",
    },
    active: {
      bg: "bg-emerald-500/15 border-emerald-500/25",
      text: "text-emerald-800 dark:text-emerald-300",
      label: "Active",
    },
    pending: {
      bg: "bg-amber-500/15 border-amber-500/25",
      text: "text-amber-900 dark:text-amber-200",
      label: "Pending review",
    },
  };
  const style = map[s] ?? {
    bg: "bg-zinc-100 border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700",
    text: "text-zinc-800 dark:text-zinc-200",
    label: status || "Unknown",
  };
  return (
    <div className={`rounded-2xl border px-4 py-3 ${style.bg}`}>
      <p className="text-[10px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Account status</p>
      <p className={`mt-1 text-sm font-black ${style.text}`}>{style.label}</p>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [panel, setPanel] = useState<Panel>("menu");
  const [balance, setBalance] = useState<number | null>(null);
  const [workerProfile, setWorkerProfile] = useState<WorkerProfileRecord | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [editName, setEditName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [nameMessage, setNameMessage] = useState<string | null>(null);

  useEffect(() => {
    return onAuthStateChanged(firebaseAuth, (u) => setUser(u));
  }, []);

  useEffect(() => {
    if (!user?.uid) {
      setBalance(null);
      return;
    }
    let cancelled = false;
    (async () => {
      const snap = await getWorkerHomeSnapshotServer(user.uid);
      if (!cancelled) setBalance(snap.balance);
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  const loadWorkerProfile = useCallback(async () => {
    if (!user?.uid) return;
    setProfileLoading(true);
    setNameMessage(null);
    try {
      const data = await getWorkerProfileRecordServer(user.uid);
      setWorkerProfile(data);
      if (data.exists) setEditName(data.fullName);
    } finally {
      setProfileLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    if (panel === "settings" && user?.uid) {
      loadWorkerProfile();
    }
  }, [panel, user?.uid, loadWorkerProfile]);

  async function logout() {
    await signOut(firebaseAuth);
    router.replace("/");
  }

  async function saveFullName() {
    if (!user?.uid) return;
    setSavingName(true);
    setNameMessage(null);
    const res = await updateWorkerFullNameServer(user.uid, editName);
    setSavingName(false);
    if (res.success) {
      setNameMessage("Name updated");
      await loadWorkerProfile();
    } else {
      setNameMessage(res.error || "Update failed");
    }
  }

  const menuRows: {
    id: string;
    title: string;
    subtitle: string;
    icon: ReactNode;
    href?: string;
    panel?: Panel;
  }[] = [
    {
      id: "bank",
      title: "Bank",
      subtitle: "Payout & account details",
      icon: <Building2 className="h-5 w-5 text-blue-600" />,
      panel: "bank",
    },
    {
      id: "withdrawalPin",
      title: "Withdrawal PIN",
      subtitle: "5-digit PIN after fee is active",
      icon: <KeyRound className="h-5 w-5 text-amber-600" />,
      href: "/user/profile/withdrawal-pin",
    },
    {
      id: "loginPassword",
      title: "Login password",
      subtitle: "Change email sign-in password",
      icon: <Fingerprint className="h-5 w-5 text-violet-600" />,
      href: "/user/profile/login-password",
    },
    {
      id: "applications",
      title: "Applications",
      subtitle: "Worker verification & status",
      icon: <FileText className="h-5 w-5 text-emerald-600" />,
      panel: "applications",
    },
    {
      id: "settings",
      title: "Settings",
      subtitle: "Worker profile & details",
      icon: <Settings className="h-5 w-5 text-zinc-600" />,
      panel: "settings",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-100 to-zinc-50 pb-28 text-zinc-900 dark:from-zinc-950 dark:to-black dark:text-zinc-50">
      <main className="mx-auto flex w-full max-w-lg flex-col px-4 pt-6">
        {panel === "menu" && (
          <>
            <div className="mb-8 flex flex-col items-center">
              <div className="relative">
                <div className="h-28 w-28 overflow-hidden rounded-full ring-4 ring-white shadow-2xl shadow-zinc-900/15 dark:ring-zinc-800">
                  <Image
                    src="/profile.jpg"
                    alt="Profile"
                    width={112}
                    height={112}
                    className="h-full w-full object-cover"
                    priority
                  />
                </div>
              </div>
              <p className="mt-5 text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">Wallet balance</p>
              <p className="mt-1 text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
                {!user ? (
                  "ETB 0.00"
                ) : balance === null ? (
                  <span className="inline-flex items-center gap-2 text-zinc-400">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </span>
                ) : (
                  `ETB ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                )}
              </p>
            </div>

            <p className="mb-3 px-1 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Account</p>
            <div className="space-y-2 rounded-[1.75rem] border border-zinc-200/80 bg-white p-2 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
              {menuRows.map((row) => {
                const className =
                  "flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left transition hover:bg-zinc-50 active:scale-[0.99] dark:hover:bg-zinc-900";
                const inner = (
                  <>
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-900">
                      {row.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-black text-zinc-900 dark:text-white">{row.title}</p>
                      <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">{row.subtitle}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 shrink-0 text-zinc-300 dark:text-zinc-600" />
                  </>
                );
                if (row.href) {
                  return (
                    <Link key={row.id} href={row.href} className={className}>
                      {inner}
                    </Link>
                  );
                }
                return (
                  <button
                    key={row.id}
                    type="button"
                    onClick={() => row.panel && setPanel(row.panel)}
                    className={className}
                  >
                    {inner}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={logout}
              className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-2xl border-2 border-rose-200 bg-rose-50 text-sm font-black text-rose-700 transition hover:bg-rose-100 active:scale-[0.99] dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/20"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </>
        )}

        {panel !== "menu" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <button
              type="button"
              onClick={() => setPanel("menu")}
              className="mb-4 flex items-center gap-2 text-sm font-bold text-emerald-600 dark:text-emerald-400"
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
              Back
            </button>

            <div className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
              {panel === "bank" && (
                <>
                  <h2 className="text-xl font-black">Bank</h2>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                    Add or manage the account where you receive withdrawals. This flow will be connected to your wallet
                    soon.
                  </p>
                  <Link
                    href="/user/wallet/withdraw"
                    className="mt-6 inline-flex h-12 items-center justify-center rounded-2xl bg-blue-600 px-6 text-sm font-black text-white shadow-lg shadow-blue-600/25"
                  >
                    Go to withdraw
                  </Link>
                </>
              )}

              {panel === "applications" && (
                <>
                  <h2 className="text-xl font-black">Applications</h2>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                    Apply as a worker or continue your verification if you have not finished yet.
                  </p>
                  <Link
                    href="/user/worker-verification"
                    className="mt-4 flex h-12 items-center justify-center rounded-2xl bg-emerald-600 text-sm font-black text-white shadow-lg"
                  >
                    Worker verification
                  </Link>
                  <Link
                    href="/user/work"
                    className="mt-3 flex h-12 items-center justify-center rounded-2xl border-2 border-zinc-200 text-sm font-black text-zinc-800 dark:border-zinc-700 dark:text-zinc-100"
                  >
                    Browse tasks
                  </Link>
                </>
              )}

              {panel === "settings" && (
                <>
                  <h2 className="text-xl font-black">Worker profile</h2>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    Data from your worker record. You can update your display name below.
                  </p>

                  {profileLoading ? (
                    <div className="mt-10 flex justify-center py-8">
                      <Loader2 className="h-9 w-9 animate-spin text-emerald-600" />
                    </div>
                  ) : !workerProfile?.exists ? (
                    <div className="mt-6 rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-6 text-center dark:border-zinc-700 dark:bg-zinc-900/40">
                      <p className="text-sm font-bold text-zinc-600 dark:text-zinc-300">No worker profile yet</p>
                      <p className="mt-1 text-xs text-zinc-500">Complete verification to see your details here.</p>
                      <Link
                        href="/user/worker-verification"
                        className="mt-4 inline-flex h-11 items-center justify-center rounded-xl bg-emerald-600 px-5 text-sm font-black text-white"
                      >
                        Apply as worker
                      </Link>
                    </div>
                  ) : (
                    <div className="mt-6 space-y-5">
                      <AccountStatusBanner status={workerProfile.status} />

                      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-wider text-emerald-700/80 dark:text-emerald-300/80">
                              Full name
                            </p>
                            <p className="mt-1 text-xs text-emerald-800/70 dark:text-emerald-200/70">
                              This is shown on your worker profile. Save after editing.
                            </p>
                          </div>
                          <Pencil className="h-4 w-4 shrink-0 text-emerald-600" />
                        </div>
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="mt-3 w-full rounded-xl border border-emerald-200/80 bg-white px-4 py-3 text-sm font-bold text-zinc-900 outline-none focus:border-emerald-500 dark:border-emerald-500/30 dark:bg-zinc-950 dark:text-white"
                          placeholder="Your name"
                        />
                        <button
                          type="button"
                          disabled={savingName || editName.trim() === workerProfile.fullName}
                          onClick={saveFullName}
                          className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-black text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {savingName ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                          Save name
                        </button>
                        {nameMessage && (
                          <p
                            className={`mt-2 text-center text-xs font-bold ${
                              nameMessage === "Name updated" ? "text-emerald-600" : "text-rose-600"
                            }`}
                          >
                            {nameMessage}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <p className="px-1 text-[10px] font-black uppercase tracking-wider text-zinc-400">Contact</p>
                        <div className="rounded-2xl border border-zinc-100 bg-zinc-50/80 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/40">
                          <p className="text-[10px] font-bold text-zinc-400">Phone</p>
                          <p className="text-sm font-black text-zinc-900 dark:text-white">{workerProfile.phoneNumber || "—"}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="px-1 text-[10px] font-black uppercase tracking-wider text-zinc-400">Identity</p>
                        <div className="rounded-2xl border border-zinc-100 bg-zinc-50/80 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/40">
                          <p className="text-[10px] font-bold text-zinc-400">ID type</p>
                          <p className="text-sm font-black text-zinc-900 dark:text-white">{formatIdType(workerProfile.idType)}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {(["idFront", "idBack"] as const).map((key) => {
                            const id = workerProfile[key];
                            const url = cloudinaryImageUrl(id);
                            return (
                              <div
                                key={key}
                                className="overflow-hidden rounded-2xl border border-zinc-100 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900"
                              >
                                <p className="px-2 py-1.5 text-center text-[9px] font-black uppercase tracking-wide text-zinc-500">
                                  {key === "idFront" ? "ID front" : "ID back"}
                                </p>
                                {url ? (
                                  <div className="relative aspect-[4/3] w-full bg-zinc-200 dark:bg-zinc-800">
                                    <Image src={url} alt={key} fill className="object-cover" sizes="160px" />
                                  </div>
                                ) : (
                                  <div className="flex aspect-[4/3] items-center justify-center text-[10px] font-bold text-zinc-400">
                                    No image
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="px-1 text-[10px] font-black uppercase tracking-wider text-zinc-400">Earnings</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-2xl border border-zinc-100 bg-zinc-50/80 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/40">
                            <p className="text-[10px] font-bold text-zinc-400">Balance</p>
                            <p className="text-lg font-black text-zinc-900 dark:text-white">
                              ETB {workerProfile.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                          </div>
                          <div className="rounded-2xl border border-zinc-100 bg-zinc-50/80 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/40">
                            <p className="text-[10px] font-bold text-zinc-400">Total withdrawal</p>
                            <p className="text-lg font-black text-zinc-900 dark:text-white">
                              ETB {workerProfile.totalWithdrawal.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="px-1 text-[10px] font-black uppercase tracking-wider text-zinc-400">Platform status</p>
                        <div className="grid gap-2 sm:grid-cols-2">
                          <StatusPill value={workerProfile.fee} label="Fee" />
                          <StatusPill value={workerProfile.facebook} label="Facebook" />
                          <StatusPill value={workerProfile.instagram} label="Instagram" />
                          <StatusPill value={workerProfile.tiktok} label="TikTok" />
                          <StatusPill value={workerProfile.youtube} label="YouTube" />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
