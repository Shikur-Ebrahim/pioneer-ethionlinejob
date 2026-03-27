"use client";

import { useEffect, useMemo, useState } from "react";
import { BottomNav } from "../_components/BottomNav";
import { getTelegramSettingsServer } from "@/app/admin/telegram/actions";
import { Loader2, MessageCircle, Send, Megaphone } from "lucide-react";

type TelegramSettings = {
  username: string;
  channelLink: string;
};

export default function SupportPage() {
  const [settings, setSettings] = useState<TelegramSettings>({ username: "", channelLink: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [showCard, setShowCard] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      const data = await getTelegramSettingsServer();
      setSettings(data);
      setIsLoading(false);
    };
    loadSettings();
  }, []);

  const usernameUrl = useMemo(() => {
    const uname = settings.username.trim().replace(/^@/, "");
    return uname ? `https://t.me/${uname}` : "";
  }, [settings.username]);

  return (
    <div className="min-h-screen bg-zinc-50 pb-20 text-zinc-900 dark:bg-black dark:text-zinc-50">
      <main className="mx-auto flex w-full max-w-3xl flex-col px-3 py-4">
        <div className="mb-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h1 className="text-2xl font-black tracking-tight">Get Support</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Tap the button below and choose how to contact support on Telegram.
          </p>
        </div>

        {isLoading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
            <button
              onClick={() => setShowCard((v) => !v)}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-500"
            >
              <MessageCircle className="h-4 w-4" />
              {showCard ? "Hide Support Options" : "Show Support Options"}
            </button>

            {showCard && (
              <div className="mt-5 space-y-3">
                <div className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
                  <p className="mb-2 text-sm font-bold">Chat with Telegram Username</p>
                  {usernameUrl ? (
                    <a
                      href={usernameUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-500"
                    >
                      <Send className="h-4 w-4" />
                      Open @{settings.username.replace(/^@/, "")}
                    </a>
                  ) : (
                    <p className="text-xs text-zinc-500">Admin has not set Telegram username yet.</p>
                  )}
                </div>

                <div className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
                  <p className="mb-2 text-sm font-bold">Open Telegram Channel</p>
                  {settings.channelLink ? (
                    <a
                      href={settings.channelLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-500"
                    >
                      <Megaphone className="h-4 w-4" />
                      Open Channel
                    </a>
                  ) : (
                    <p className="text-xs text-zinc-500">Admin has not set Telegram channel link yet.</p>
                  )}
                </div>
              </div>
            )}
          </section>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
