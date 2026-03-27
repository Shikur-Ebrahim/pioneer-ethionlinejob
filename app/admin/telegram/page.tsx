"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { getTelegramSettingsServer, saveTelegramSettingsServer } from "./actions";

export default function TelegramAdminPage() {
  const [username, setUsername] = useState("");
  const [channelLink, setChannelLink] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const data = await getTelegramSettingsServer();
      setUsername(data.username || "");
      setChannelLink(data.channelLink || "");
      setIsLoading(false);
    };
    load();
  }, []);

  const onSave = async () => {
    setIsSaving(true);
    const result = await saveTelegramSettingsServer({ username, channelLink });
    setIsSaving(false);
    if (result.success) {
      alert("Telegram settings saved.");
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
        <h1 className="text-3xl font-black text-zinc-900 dark:text-zinc-100">Telegram Support</h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Save Telegram username and channel link for user support redirection.
        </p>
      </div>

      <div className="space-y-5 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div>
          <label className="mb-1 block text-sm font-semibold text-zinc-700 dark:text-zinc-200">
            Telegram Username (without @)
          </label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="example_username"
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-zinc-700 dark:text-zinc-200">
            Telegram Channel Link
          </label>
          <input
            value={channelLink}
            onChange={(e) => setChannelLink(e.target.value)}
            placeholder="https://t.me/your_channel"
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>

        <button
          onClick={onSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Telegram Data
        </button>
      </div>
    </div>
  );
}
