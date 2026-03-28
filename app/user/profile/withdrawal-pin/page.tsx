"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase/client";
import { BottomNav } from "../../_components/BottomNav";
import { getWithdrawalPinStatusServer, setWithdrawalPinServer, type WithdrawalPinStatus } from "../pin-actions";
import { ChevronLeft, Loader2, Lock, ShieldCheck } from "lucide-react";

const PIN_REGEX = /^\d{5}$/;

function FiveDigitPinField({
  label,
  value,
  onChange,
  disabled,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  autoComplete?: string;
}) {
  return (
    <div>
      <p className="mb-2 text-center text-[11px] font-black uppercase tracking-wider text-zinc-400">{label}</p>
      <input
        type="password"
        inputMode="numeric"
        autoComplete={autoComplete ?? "off"}
        maxLength={5}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 5))}
        className="w-full rounded-2xl border-2 border-zinc-200 bg-zinc-50 py-4 text-center text-2xl font-black tracking-[0.65em] text-zinc-900 outline-none transition focus:border-amber-500 focus:bg-white dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:border-amber-500/60"
        placeholder="•••••"
      />
    </div>
  );
}

export default function WithdrawalPinPage() {
  const router = useRouter();
  const [uid, setUid] = useState<string | null>(null);
  const [status, setStatus] = useState<WithdrawalPinStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const refresh = useCallback(async (userId: string) => {
    const s = await getWithdrawalPinStatusServer(userId);
    setStatus(s);
  }, []);

  useEffect(() => {
    return onAuthStateChanged(firebaseAuth, (u) => {
      setUid(u?.uid ?? null);
      if (!u) router.replace("/auth/login");
    });
  }, [router]);

  useEffect(() => {
    if (!uid) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      await refresh(uid);
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [uid, refresh]);

  const canUseForm = status?.workerExists && status.feeActive;
  const formValid =
    PIN_REGEX.test(newPin) &&
    newPin === confirmPin &&
    (!status?.pinIsSet || PIN_REGEX.test(currentPin));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!uid) return;
    setMsg(null);
    setSaving(true);
    const res = await setWithdrawalPinServer(uid, status?.pinIsSet ? currentPin : null, newPin, confirmPin);
    setSaving(false);
    if (res.success) {
      setMsg({ type: "ok", text: status?.pinIsSet ? "Withdrawal PIN updated" : "Withdrawal PIN saved" });
      setCurrentPin("");
      setNewPin("");
      setConfirmPin("");
      await refresh(uid);
    } else {
      setMsg({ type: "err", text: res.error });
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-amber-50 via-white to-zinc-50 pb-28 dark:from-amber-950/40 dark:via-zinc-950 dark:to-black">
      <div className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-amber-400/20 blur-3xl dark:bg-amber-500/10" />
      <div className="pointer-events-none absolute -right-16 bottom-40 h-56 w-56 rounded-full bg-orange-400/15 blur-3xl" />

      <header className="relative z-10 border-b border-amber-100/80 bg-white/90 px-4 py-4 backdrop-blur-md dark:border-amber-900/30 dark:bg-zinc-950/90">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <Link
            href="/user/profile"
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-800 transition active:scale-95 dark:bg-amber-500/15 dark:text-amber-200"
            aria-label="Back to profile"
          >
            <ChevronLeft className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-lg font-black tracking-tight text-zinc-900 dark:text-white">Withdrawal PIN</h1>
            <p className="text-[11px] font-bold text-amber-700/80 dark:text-amber-300/80">5-digit security for cash-outs</p>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-lg px-4 pt-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-amber-600" />
          </div>
        ) : !status?.workerExists ? (
          <div className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-900">
              <Lock className="h-7 w-7 text-zinc-400" />
            </div>
            <p className="text-center text-sm font-bold leading-relaxed text-zinc-700 dark:text-zinc-300">
              Complete worker verification first. After an admin marks your fee as active, you can set your withdrawal PIN
              here.
            </p>
            <Link
              href="/user/worker-verification"
              className="mt-5 flex h-12 items-center justify-center rounded-2xl bg-amber-600 text-sm font-black text-white shadow-lg shadow-amber-600/25"
            >
              Go to verification
            </Link>
          </div>
        ) : !status.feeActive ? (
          <div className="rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6 shadow-lg dark:border-amber-500/25 dark:from-amber-950/50 dark:to-orange-950/30">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm dark:bg-zinc-900">
              <ShieldCheck className="h-7 w-7 text-amber-600" />
            </div>
            <h2 className="text-center text-base font-black text-amber-950 dark:text-amber-100">Fee not active yet</h2>
            <p className="mt-2 text-center text-sm font-medium leading-relaxed text-amber-900/80 dark:text-amber-200/80">
              An admin must verify your registration fee and set it to <span className="font-black">active</span> before you
              can create a withdrawal PIN. This page stays available — check back after approval.
            </p>
            <Link
              href="/user/profile"
              className="mt-6 flex h-12 items-center justify-center rounded-2xl border-2 border-amber-300 bg-white text-sm font-black text-amber-900 dark:border-amber-600/50 dark:bg-zinc-950 dark:text-amber-100"
            >
              Back to profile
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-center text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                Enter a 5-digit PIN you will use when withdrawing funds. Never share it with anyone.
              </p>

              <div className="mt-8 space-y-6">
                {status.pinIsSet && (
                  <FiveDigitPinField
                    label="Current PIN"
                    value={currentPin}
                    onChange={setCurrentPin}
                    disabled={saving}
                    autoComplete="off"
                  />
                )}
                <FiveDigitPinField label={status.pinIsSet ? "New PIN" : "Choose PIN"} value={newPin} onChange={setNewPin} disabled={saving} />
                <FiveDigitPinField label="Confirm PIN" value={confirmPin} onChange={setConfirmPin} disabled={saving} />
              </div>

              {msg && (
                <p
                  className={`mt-5 text-center text-sm font-bold ${msg.type === "ok" ? "text-emerald-600" : "text-rose-600"}`}
                >
                  {msg.text}
                </p>
              )}

              <button
                type="submit"
                disabled={saving || !canUseForm || !formValid}
                className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-[15px] font-black text-white shadow-lg shadow-amber-500/30 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Lock className="h-5 w-5" />}
                {status.pinIsSet ? "Update withdrawal PIN" : "Save withdrawal PIN"}
              </button>
            </div>
          </form>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
