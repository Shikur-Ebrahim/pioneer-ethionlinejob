"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase/client";
import { getIsAdmin } from "@/lib/firebase/claims";

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(firebaseAuth, async (u) => {
      setUser(u);
      if (!u) {
        setChecking(false);
        router.replace("/auth/login");
        return;
      }
      try {
        const isAdmin = await getIsAdmin(u);
        if (!isAdmin) router.replace("/user");
      } finally {
        setChecking(false);
      }
    });
  }, [router]);

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
          <button
            type="button"
            onClick={logout}
            className="text-sm font-semibold text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
          >
            Sign out
          </button>
        </div>

        <div className="mt-10 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Admin
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            {checking
              ? "Checking access…"
              : user
                ? `Signed in as ${user.email ?? user.uid}.`
                : "Not signed in."}
          </p>
          <div className="mt-6 text-sm text-zinc-700 dark:text-zinc-300">
            This is the admin landing page.
          </div>
        </div>
      </main>
    </div>
  );
}

