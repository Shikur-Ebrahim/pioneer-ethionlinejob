"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase/client";

export default function UserHomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    return onAuthStateChanged(firebaseAuth, (u) => setUser(u));
  }, []);

  async function logout() {
    await signOut(firebaseAuth);
    router.replace("/");
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50">
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col px-6 py-10">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-sm font-semibold">
            pioneer-ethionlinejob
          </Link>
          {user ? (
            <button
              type="button"
              onClick={logout}
              className="text-sm font-semibold text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
            >
              Sign out
            </button>
          ) : (
            <Link
              href="/auth"
              className="text-sm font-semibold text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
            >
              Sign in
            </Link>
          )}
        </div>

        <div className="mt-10 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Welcome
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            {user
              ? `You are signed in as ${user.email ?? user.uid}.`
              : "You are not signed in yet."}
          </p>
        </div>
      </main>
    </div>
  );
}

