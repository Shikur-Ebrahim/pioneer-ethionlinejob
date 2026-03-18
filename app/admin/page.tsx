"use client";

import { signOut } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase/client";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  async function logout() {
    await signOut(firebaseAuth);
    router.replace("/");
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <button
          type="button"
          onClick={logout}
          className="px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 font-medium transition-colors"
        >
          Sign out
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="font-semibold text-zinc-500 dark:text-zinc-400 text-sm">Total Users</h3>
          <p className="text-3xl font-bold mt-2">1,248</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="font-semibold text-zinc-500 dark:text-zinc-400 text-sm">Active Banners</h3>
          <p className="text-3xl font-bold mt-2">12</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="font-semibold text-zinc-500 dark:text-zinc-400 text-sm">Total Views</h3>
          <p className="text-3xl font-bold mt-2">84.2K</p>
        </div>
      </div>
      
      <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        <div className="text-sm text-zinc-600 dark:text-zinc-400">
          This is the admin landing page. More statistics and details will appear here.
        </div>
      </div>
    </div>
  );
}

