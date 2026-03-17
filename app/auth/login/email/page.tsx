"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase/client";
import { getIsAdmin } from "@/lib/firebase/claims";

export default function EmailLoginPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function loginWithEmail(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    setBusy(true);
    try {
      const cred = await signInWithEmailAndPassword(firebaseAuth, email, password);
      await cred.user.reload();
      if (cred.user.emailVerified) {
        const isAdmin = await getIsAdmin(cred.user);
        router.replace(isAdmin ? "/admin" : "/user");
        return;
      }
      await signOut(firebaseAuth);
      setMessage("Please verify your email first, then log in again.");
    } catch (err) {
      setMessage(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50">
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-8 sm:max-w-xl sm:px-6 sm:py-10">
        <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="inline-flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="pioneer-ethionlinejob logo"
                width={48}
                height={48}
                className="h-10 w-10 rounded-xl object-contain shadow-sm"
                priority
              />
              <span className="text-sm font-semibold tracking-tight sm:text-base">
                pioneer-ethionlinejob
              </span>
            </Link>
            <Link
              href="/auth/login"
              className="text-sm font-semibold text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
            >
              Back
            </Link>
          </div>

          <div className="mt-6">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Log in with Email
            </h1>
          </div>

          <form className="mt-6 grid gap-3" onSubmit={loginWithEmail}>
            <label className="grid gap-1 text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">Email</span>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                placeholder="you@example.com"
                className="h-11 rounded-xl border border-zinc-200 bg-white px-3 outline-none ring-zinc-300 focus:ring-2 dark:border-zinc-800 dark:bg-black dark:ring-zinc-700"
                autoComplete="email"
              />
            </label>

            <label className="grid gap-1 text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">Password</span>
              <div className="flex items-center gap-2">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Your password"
                  className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 outline-none ring-zinc-300 focus:ring-2 dark:border-zinc-800 dark:bg-black dark:ring-zinc-700"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </label>

            <button
              disabled={busy}
              className="mt-1 inline-flex h-11 items-center justify-center rounded-xl bg-zinc-900 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
              type="submit"
            >
              Log in
            </button>
          </form>

          <div className="mt-6 min-h-6 text-sm">
            {message ? (
              <p className="text-zinc-700 dark:text-zinc-300">{message}</p>
            ) : null}
          </div>

          <div className="mt-6 border-t border-zinc-200 pt-4 text-center text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
            Don’t have an account?{" "}
            <Link
              href="/auth"
              className="font-semibold text-zinc-900 hover:underline dark:text-zinc-50"
            >
              Sign up
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

function getErrorMessage(err: unknown) {
  if (err && typeof err === "object" && "message" in err) {
    return String((err as { message?: unknown }).message ?? "Something went wrong");
  }
  return "Something went wrong";
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M10.733 5.08A10.94 10.94 0 0 1 12 5c6.5 0 10 7 10 7a18.4 18.4 0 0 1-3.114 4.464" />
      <path d="M6.61 6.61A18.4 18.4 0 0 0 2 12s3.5 7 10 7c1.58 0 3.042-.355 4.36-.988" />
      <path d="M9.9 9.9a3 3 0 0 0 4.243 4.243" />
      <path d="M14.1 14.1 9.9 9.9" />
      <path d="M3 3l18 18" />
    </svg>
  );
}

