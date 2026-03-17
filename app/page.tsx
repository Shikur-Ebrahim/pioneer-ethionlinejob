import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 dark:bg-black dark:text-zinc-50">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.22),rgba(59,130,246,0)_60%)] blur-2xl dark:bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.18),rgba(56,189,248,0)_60%)]" />
        <div className="absolute -bottom-32 right-1/2 h-[28rem] w-[28rem] translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.16),rgba(16,185,129,0)_60%)] blur-2xl dark:bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.14),rgba(34,197,94,0)_60%)]" />
      </div>

      <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-6">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="pioneer-ethionlinejob logo"
            width={48}
            height={48}
            priority
            className="h-10 w-10 rounded-xl bg-white object-contain shadow-sm ring-1 ring-black/5 dark:bg-zinc-950 dark:ring-white/10"
          />
          <span className="text-sm font-semibold tracking-tight sm:text-base">
            pioneer-ethionlinejob
          </span>
        </div>

        <Link
          href="/auth"
          className="inline-flex h-10 items-center justify-center rounded-xl bg-zinc-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          Sign up
        </Link>
      </header>

      <main className="relative mx-auto flex min-h-[calc(100vh-80px)] max-w-6xl flex-col justify-center px-5 pb-16 pt-10 sm:px-6 sm:pt-16">
        <div className="flex flex-col items-start">
            <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Find opportunities faster with{" "}
              <span className="bg-gradient-to-r from-zinc-900 to-zinc-500 bg-clip-text text-transparent dark:from-white dark:to-zinc-400">
                pioneer-ethionlinejob
              </span>
              .
            </h1>

            <p className="mt-4 max-w-2xl text-pretty text-base leading-7 text-zinc-600 dark:text-zinc-400 sm:text-lg">
              A clean, modern platform to discover roles, track applications, and
              stay ready for your next move.
            </p>

            <div className="mt-8 grid w-full max-w-md grid-cols-2 gap-3 sm:flex sm:w-auto sm:max-w-none sm:items-center">
              <Link
                href="/auth"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-zinc-900 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
              >
                Create account
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-zinc-200 bg-white px-5 text-sm font-semibold text-zinc-900 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
              >
                Log in
              </Link>
            </div>
        </div>
      </main>
    </div>
  );
}
