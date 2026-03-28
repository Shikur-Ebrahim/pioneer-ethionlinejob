"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { EmailAuthProvider, onAuthStateChanged, reauthenticateWithCredential, updatePassword, type User } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase/client";
import { BottomNav } from "../../_components/BottomNav";
import { ChevronLeft, Eye, EyeOff, Fingerprint, Loader2, Smartphone } from "lucide-react";

function getErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "code" in err) {
    const code = String((err as { code?: string }).code);
    if (code === "auth/wrong-password" || code === "auth/invalid-credential") return "Current password is incorrect";
    if (code === "auth/weak-password") return "New password is too weak. Use at least 6 characters";
    if (code === "auth/requires-recent-login") return "Please sign out and sign in again, then try changing your password";
    if (code === "auth/too-many-requests") return "Too many attempts. Try again later";
  }
  if (err instanceof Error) return err.message;
  return "Something went wrong";
}

export default function LoginPasswordPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCur, setShowCur] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showCf, setShowCf] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const isEmailProvider =
    user?.providerData?.some((p) => p.providerId === "password") &&
    !!user.email;

  useEffect(() => {
    return onAuthStateChanged(firebaseAuth, (u) => {
      setUser(u);
      setLoading(false);
      if (!u) router.replace("/auth/login");
    });
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !user.email) return;
    setMsg(null);

    if (newPassword.length < 6) {
      setMsg({ type: "err", text: "New password must be at least 6 characters" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMsg({ type: "err", text: "New password and confirmation do not match" });
      return;
    }

    setBusy(true);
    try {
      const cred = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, newPassword);
      setMsg({ type: "ok", text: "Password updated successfully" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setMsg({ type: "err", text: getErrorMessage(err) });
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <Loader2 className="h-10 w-10 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-violet-50 via-white to-zinc-50 pb-28 dark:from-violet-950/30 dark:via-zinc-950 dark:to-black">
      <div className="pointer-events-none absolute -right-24 top-20 h-72 w-72 rounded-full bg-violet-400/20 blur-3xl dark:bg-violet-600/15" />
      <div className="pointer-events-none absolute -left-16 bottom-32 h-56 w-56 rounded-full bg-fuchsia-400/15 blur-3xl" />

      <header className="relative z-10 border-b border-violet-100/80 bg-white/90 px-4 py-4 backdrop-blur-md dark:border-violet-900/30 dark:bg-zinc-950/90">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <Link
            href="/user/profile"
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-800 transition active:scale-95 dark:bg-violet-500/15 dark:text-violet-200"
            aria-label="Back to profile"
          >
            <ChevronLeft className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-lg font-black tracking-tight text-zinc-900 dark:text-white">Login password</h1>
            <p className="text-[11px] font-bold text-violet-700/80 dark:text-violet-300/80">Change your account password</p>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-lg px-4 pt-6">
        {!isEmailProvider ? (
          <div className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 dark:bg-violet-500/20">
              <Smartphone className="h-7 w-7 text-violet-600" />
            </div>
            <h2 className="text-center text-base font-black text-zinc-900 dark:text-white">Email password not available</h2>
            <p className="mt-2 text-center text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              You signed in with phone or another provider. Changing a password applies to{" "}
              <span className="font-bold">email &amp; password</span> accounts only. Use your original sign-in method, or
              link an email account from support if needed.
            </p>
            <Link
              href="/user/support"
              className="mt-5 flex h-12 items-center justify-center rounded-2xl bg-violet-600 text-sm font-black text-white"
            >
              Contact support
            </Link>
            <Link
              href="/auth/login"
              className="mt-3 flex h-12 items-center justify-center rounded-2xl border-2 border-zinc-200 text-sm font-black text-zinc-800 dark:border-zinc-700 dark:text-zinc-100"
            >
              Sign-in options
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white shadow-lg">
              <Fingerprint className="h-7 w-7" />
            </div>
            <p className="text-center text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Enter your current password, then choose a new one. You will use the new password next time you sign in with
              email.
            </p>

            <div className="mt-8 space-y-4">
              <div>
                <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-zinc-400">Current password</label>
                <div className="relative">
                  <input
                    type={showCur ? "text" : "password"}
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full rounded-2xl border-2 border-zinc-200 bg-zinc-50 py-3.5 pl-4 pr-12 text-sm font-bold text-zinc-900 outline-none focus:border-violet-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                    required
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowCur((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                    aria-label={showCur ? "Hide password" : "Show password"}
                  >
                    {showCur ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-zinc-400">New password</label>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-2xl border-2 border-zinc-200 bg-zinc-50 py-3.5 pl-4 pr-12 text-sm font-bold text-zinc-900 outline-none focus:border-violet-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowNew((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                    aria-label={showNew ? "Hide password" : "Show password"}
                  >
                    {showNew ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-zinc-400">Confirm new password</label>
                <div className="relative">
                  <input
                    type={showCf ? "text" : "password"}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-2xl border-2 border-zinc-200 bg-zinc-50 py-3.5 pl-4 pr-12 text-sm font-bold text-zinc-900 outline-none focus:border-violet-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowCf((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                    aria-label={showCf ? "Hide password" : "Show password"}
                  >
                    {showCf ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            {msg && (
              <p className={`mt-5 text-center text-sm font-bold ${msg.type === "ok" ? "text-emerald-600" : "text-rose-600"}`}>
                {msg.text}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-[15px] font-black text-white shadow-lg shadow-violet-500/25 transition active:scale-[0.98] disabled:opacity-50"
            >
              {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
              Update password
            </button>
          </form>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
