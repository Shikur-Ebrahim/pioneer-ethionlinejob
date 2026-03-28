"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, BellRing } from "lucide-react";
import {
  getWelcomeNotificationSettingsServer,
  saveWelcomeNotificationSettingsServer,
} from "./actions";

export default function WelcomeNotificationAdminPage() {
  const [maxDisplayCount, setMaxDisplayCount] = useState(2);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const data = await getWelcomeNotificationSettingsServer();
      setMaxDisplayCount(data.maxDisplayCount);
      setIsLoading(false);
    };
    load();
  }, []);

  const onSave = async () => {
    setIsSaving(true);
    const result = await saveWelcomeNotificationSettingsServer(maxDisplayCount);
    setIsSaving(false);
    if (result.success) {
      alert("Welcome notification settings saved.");
    } else {
      alert(result.error || "Failed to save");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-black text-zinc-900 dark:text-zinc-100">Welcome notification</h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Control how many times new users see the &quot;Apply for work&quot; card on the home screen after login. After
          this many impressions, the card stops appearing (until you change this value). Use 0 to turn the card off.
        </p>
      </div>

      <div className="space-y-5 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex gap-4 rounded-xl border border-amber-100 bg-amber-50/80 p-4 dark:border-amber-500/20 dark:bg-amber-500/10">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm dark:bg-zinc-900">
            <BellRing className="h-6 w-6" />
          </div>
          <p className="text-xs font-medium leading-relaxed text-amber-900/80 dark:text-amber-200/80">
            The card only shows to users who still need to complete worker verification (no application submitted yet).
            Each time they open the app in a new browser session counts as one impression once the card is shown.
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-200">
            Max times to show the welcome card
          </label>
          <input
            type="number"
            min={0}
            max={10}
            value={maxDisplayCount}
            onChange={(e) => setMaxDisplayCount(Number(e.target.value))}
            className="w-full max-w-xs rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900"
          />
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            Typical: 2 (first and second visit). Range 0–10.
          </p>
        </div>

        <button
          onClick={onSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save settings
        </button>
      </div>
    </div>
  );
}
