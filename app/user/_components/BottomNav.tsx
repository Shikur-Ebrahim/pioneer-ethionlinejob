"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Briefcase, ClipboardList, User } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { id: "home", label: "Home", icon: <Home size={20} />, href: "/user" },
    { id: "work", label: "Work", icon: <Briefcase size={20} />, href: "/user/work" },
    { id: "record", label: "Record", icon: <ClipboardList size={20} />, href: "/user/record" },
    { id: "profile", label: "Profile", icon: <User size={20} />, href: "/user/profile" },
  ];

  const isActive = (href: string) => {
    if (href === "/user") return pathname === "/user";
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full border-t border-zinc-200 bg-white/80 pb-safe backdrop-blur-md dark:border-zinc-800 dark:bg-black/80 sm:hidden">
      <div className="mx-auto grid h-16 max-w-lg grid-cols-4 items-center">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 transition-colors duration-200 ${
                active
                  ? "text-emerald-600 dark:text-emerald-500"
                  : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              <div className={`p-1 rounded-lg transition-all ${active ? "bg-emerald-500/10 scale-110" : ""}`}>
                {item.icon}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
