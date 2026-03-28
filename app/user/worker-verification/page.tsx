"use client";

import { useRouter } from "next/navigation";
import { BottomNav } from "../_components/BottomNav";
import { WorkerVerificationWizard } from "../_components/WorkerVerificationWizard";

export default function WorkerVerificationPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-100 to-zinc-50 pb-28 dark:from-zinc-950 dark:to-black">
      <div className="mx-auto max-w-xl px-3 pt-4 sm:px-4 sm:pt-6">
        <p className="mb-3 text-center text-[10px] font-black uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-400">
          One-time setup
        </p>
        <WorkerVerificationWizard
          variant="page"
          onClose={() => router.push("/user")}
          successHref="/user/work"
        />
      </div>
      <BottomNav />
    </div>
  );
}
