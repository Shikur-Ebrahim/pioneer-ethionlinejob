"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase/client";
import { BottomNav } from "../_components/BottomNav";

export default function WorkPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    return onAuthStateChanged(firebaseAuth, (u) => setUser(u));
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50 pb-20">
      <main className="mx-auto flex flex-col max-w-3xl px-6 py-10">
        <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 shadow-sm">
          <h1 className="text-2xl font-semibold tracking-tight">Available Ads (Work)</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Start viewing advertisements to earn daily income. This is your dedicated workspace.
          </p>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
