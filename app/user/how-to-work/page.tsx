"use client";

import { useEffect, useState } from "react";
import { BottomNav } from "../_components/BottomNav";
import { getWorkflowStepsServer } from "@/app/admin/workflow/actions";
import { Loader2, Sparkles } from "lucide-react";

type WorkflowStep = {
  id: string;
  text: string;
  order: number;
};

export default function HowToWorkPage() {
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSteps = async () => {
      setIsLoading(true);
      try {
        const data = (await getWorkflowStepsServer()) as WorkflowStep[];
        setSteps(data || []);
      } catch (error) {
        console.error("Failed to load workflow steps:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadSteps();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 pb-20 text-zinc-900 dark:bg-black dark:text-zinc-50">
      <main className="mx-auto flex w-full max-w-3xl flex-col px-3 py-4">
        <section className="mb-4 overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-blue-600 via-indigo-600 to-emerald-500 p-5 text-white shadow-xl">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-[11px] font-black uppercase tracking-wide">
            <Sparkles className="h-3.5 w-3.5" />
            How To Work
          </div>
          <h1 className="text-2xl font-black leading-tight">Follow these steps and start earning daily income.</h1>
          <p className="mt-2 text-sm text-white/90">
            This guide is managed by admin and updates automatically.
          </p>
        </section>

        {isLoading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : steps.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-zinc-300 bg-white p-8 text-center dark:border-zinc-700 dark:bg-zinc-950">
            <p className="text-sm font-bold">No workflow steps found</p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Admin can add steps from the Work Flow page.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {steps.map((step, idx) => (
              <article
                key={step.id}
                className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-black text-white">
                    {idx + 1}
                  </div>
                  <p className="text-sm leading-6 text-zinc-700 dark:text-zinc-200">{step.text}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
