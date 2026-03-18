"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase/client";
import { BottomNav } from "../_components/BottomNav";

export default function ProfilePage() {
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
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50 pb-20">
      <main className="mx-auto flex flex-col max-w-3xl px-6 py-10">
        <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 shadow-sm relative overflow-hidden">
          <div className="flex flex-col gap-1 mb-6">
            <h1 className="text-2xl font-semibold tracking-tight">User Profile</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Manage your account and sign out from here.
            </p>
          </div>

          <div className="space-y-4 border-t border-zinc-100 dark:border-zinc-900 pt-6">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Email Address</span>
              <p className="text-zinc-900 dark:text-zinc-100 font-medium">{user?.email ?? user?.uid ?? "Not signed in"}</p>
            </div>
            
            <div className="pt-6">
              <button
                type="button"
                onClick={logout}
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-red-50 px-6 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20"
              >
                Sign out of account
              </button>
            </div>
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
