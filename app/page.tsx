import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import { Target, TrendingUp, Wallet, Compass } from "lucide-react";
import { getWelcomeVideosServer } from "./admin/welcome-video/actions";
import { getBannersServer } from "./admin/add-banner/actions";

export const dynamic = "force-dynamic";

export default async function Home() {
  const videos = (await getWelcomeVideosServer()) || [];
  const latestVideo = videos.length > 0 ? (videos[0] as any) : null;
  const banners = (await getBannersServer()) || [];

  const getCloudinaryUrl = (id: string, resourceType: string = "video") => {
    if (!id) return "";
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    return `https://res.cloudinary.com/${cloudName}/${resourceType}/upload/${id}`;
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 dark:bg-black dark:text-zinc-50 overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.22),rgba(59,130,246,0)_60%)] blur-2xl dark:bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.18),rgba(56,189,248,0)_60%)]" />
        <div className="absolute -bottom-32 right-1/2 h-[28rem] w-[28rem] translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.16),rgba(16,185,129,0)_60%)] blur-2xl dark:bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.14),rgba(34,197,94,0)_60%)]" />
      </div>

      <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-5 pt-2 pb-0 sm:px-6 sm:py-5">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="pioneer-ethionlinejob logo"
            width={48}
            height={48}
            priority
            className="h-10 w-10 rounded-xl bg-white object-contain shadow-sm ring-1 ring-black/5 dark:bg-zinc-950 dark:ring-white/10"
          />
          <span className="text-sm font-semibold tracking-tight sm:text-base text-black dark:text-white">
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

      <main className="relative mx-auto max-w-6xl px-2 pb-32 pt-0 sm:px-6 sm:pt-2">
        {/* Responsive Hero Section with Synchronized Video */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-12 items-center w-full pt-0">

          {/* Mobile-Only Video: At the top (Hidden on Desktop) */}
          {latestVideo?.imageId && (
            <div className="w-full h-full lg:hidden order-1 pt-1">
              <div className="group relative aspect-[4/3] sm:aspect-video w-full overflow-hidden bg-zinc-900 rounded-xl shadow-xl ring-1 ring-zinc-200 dark:ring-zinc-800">
                <video
                  src={getCloudinaryUrl(latestVideo.imageId, "video")}
                  className="h-full w-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  controls
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
              </div>
            </div>
          )}

          {/* Text Content (Left on Desktop, Below Video on Mobile) */}
          <div className="flex flex-col items-start px-0 py-1 lg:py-0 order-2 lg:order-1">
            <h1 className="text-balance text-2xl font-bold tracking-tight sm:text-4xl lg:text-6xl text-black dark:text-white">
              Start your journey with{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                Pioneer Ethio Online Job
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-pretty text-base leading-7 text-zinc-600 dark:text-zinc-400 sm:text-lg">
              Create your account and sign up easily. After sign up, you can apply to work with us and start earning daily income through advertisement tasks.
            </p>

            <div className="mt-8 grid w-full grid-cols-2 gap-3 sm:flex sm:w-auto sm:max-w-none sm:items-center">
              <Link
                href="/auth"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-emerald-600 px-4 sm:px-8 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-500 hover:-translate-y-0.5"
              >
                Start Working
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 sm:px-8 text-sm font-bold text-zinc-900 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
              >
                Log in
              </Link>
            </div>
          </div>

          {/* Desktop-Only Video: At the right (Hidden on Mobile) */}
          {latestVideo?.imageId && (
            <div className="hidden lg:block w-full h-full min-h-[460px] xl:min-h-[520px] order-3 lg:order-2">
              <div className="group relative h-full w-full overflow-hidden bg-zinc-900">
                <video
                  src={getCloudinaryUrl(latestVideo.imageId, "video")}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                  autoPlay
                  muted
                  loop
                  playsInline
                  controls
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
              </div>
            </div>
          )}
        </div>

        {/* Advanced Features Grid */}
        <div className="mt-20 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 w-full">
          {[
            {
              title: "Ad Tasks",
              desc: "View or click advertisements and earn daily income by completing simple tasks.",
              icon: <Target className="w-5 h-5 text-emerald-500" />
            },
            {
              title: "Daily Income",
              desc: "We collaborate with companies to provide daily advertisement jobs with reliable pay.",
              icon: <TrendingUp className="w-5 h-5 text-emerald-500" />
            },
            {
              title: "Easy Withdrawals",
              desc: "Withdraw your earnings easily using Ethiopian banks or local mobile wallets.",
              icon: <Wallet className="w-5 h-5 text-emerald-500" />
            }
          ].map((feature, i) => (
            <div key={i} className="group p-6 rounded-2xl bg-white/50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-sm hover:border-emerald-500/30 transition-all hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-1">
              <div className="mb-4 inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
                {feature.icon}
              </div>
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2">{feature.title}</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Scrolling Banners Footer Section - Fixed Bottom Strip */}
      {banners.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full z-10 border-t border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-md overflow-hidden select-none">

          <div className="flex animate-marquee-reverse whitespace-nowrap gap-0">
            {/* Infinite loop items */}
            {[...banners, ...banners].map((banner: any, index: number) => {
              const bImg = getCloudinaryUrl(banner.imageId, "image");
              if (!bImg) return null;
              return (
                <Fragment key={`${banner.imageId || index}-${index}`}>
                  <div className="relative h-16 w-32 sm:h-28 sm:w-48 md:h-36 md:w-64 flex-shrink-0 group overflow-hidden px-1 py-1">
                    <Image
                      src={bImg}
                      alt={banner.name || "Banner"}
                      fill
                      className="object-contain rounded-lg group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="w-0.5 h-full bg-zinc-200 dark:bg-zinc-800" />
                </Fragment>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
