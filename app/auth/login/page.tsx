"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase/client";
import { getIsAdmin } from "@/lib/firebase/claims";

export default function LoginPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function continueWithGoogle() {
    setMessage(null);
    setBusy(true);
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(firebaseAuth, provider);
      const isAdmin = await getIsAdmin(cred.user);
      router.replace(isAdmin ? "/admin" : "/user");
    } catch (e) {
      setMessage(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50">
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-8 sm:max-w-xl sm:px-6 sm:py-10">
        <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-8">
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

          <div className="mt-6">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Log in
            </h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Choose a login method below.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <button
              type="button"
              onClick={continueWithGoogle}
              disabled={busy}
              className="inline-flex h-12 items-center justify-center gap-3 rounded-2xl bg-zinc-900 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              <GoogleIcon className="h-5 w-5" />
              Continue with Google
            </button>

            <Link
              href="/auth/login/email"
              className="inline-flex h-12 items-center justify-center gap-3 rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-semibold transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
            >
              <MailIcon className="h-5 w-5 text-zinc-700 dark:text-zinc-200" />
              Continue with Email
            </Link>

            <Link
              href="/auth/login/phone"
              className="inline-flex h-12 items-center justify-center gap-3 rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-semibold transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
            >
              <PhoneIcon className="h-5 w-5 text-zinc-700 dark:text-zinc-200" />
              Continue with Phone number
            </Link>
          </div>

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
    return String(
      (err as { message?: unknown }).message ?? "Something went wrong"
    );
  }
  return "Something went wrong";
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303C33.651 32.657 29.194 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.047 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917Z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 16.108 19.01 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.047 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691Z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.167 35.091 26.715 36 24 36c-5.173 0-9.619-3.318-11.283-7.946l-6.52 5.025C9.505 39.556 16.227 44 24 44Z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.084 5.57l.003-.002 6.19 5.238C36.975 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917Z"
      />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
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
      <path d="M4 4h16v16H4z" />
      <path d="m4 6 8 7 8-7" />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
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
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.86.31 1.7.57 2.5a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.58-1.05a2 2 0 0 1 2.11-.45c.8.26 1.64.45 2.5.57A2 2 0 0 1 22 16.92Z" />
    </svg>
  );
}

