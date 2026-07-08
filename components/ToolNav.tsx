"use client";

import Link from "next/link";
import { Shield } from "lucide-react";
import LanguagePicker from "./LanguagePicker";
import { useUIStrings } from "@/lib/useUIStrings";

// One consistent top nav for every tool page (dashboard, health, photo, map),
// so a parent can jump directly between tools instead of going Home first. The
// active tool is highlighted; the language selector stays reachable everywhere.
export default function ToolNav({ active }: { active?: "dashboard" | "health" | "vision" | "heatmap" | "offline" | "profile" }) {
  const { t } = useUIStrings();
  const links = [
    { href: "/dashboard", label: t.isMyChildInDanger, key: "dashboard" as const },
    { href: "/health", label: t.myChildIsSick, key: "health" as const },
    { href: "/vision", label: t.sendAPhoto, key: "vision" as const },
    { href: "/heatmap", label: t.worldMap, key: "heatmap" as const },
    { href: "/offline-guide", label: `🔦 ${t.helpWithoutInternet}`, key: "offline" as const },
    { href: "/profile", label: t.myChildren, key: "profile" as const },
  ];

  return (
    <nav className="bg-[#0f2844] sticky top-0 z-50 shadow-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-4 lg:gap-8 min-w-0">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Shield className="text-blue-300 w-5 h-5" />
            <span className="text-lg font-bold text-white tracking-tight">ClimaGuard</span>
          </Link>
          <div className="hidden lg:flex items-center gap-0.5">
            {links.map((l) => (
              <Link
                key={l.key}
                href={l.href}
                dir="auto"
                className={`text-sm px-3 py-2 rounded-lg font-semibold transition whitespace-nowrap ${
                  active === l.key ? "bg-white/15 text-white" : "text-slate-200 hover:text-white hover:bg-white/10"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="shrink-0">
          <LanguagePicker theme="dark" />
        </div>
      </div>
      {/* Mobile / tablet: horizontally-scrollable tool links */}
      <div className="lg:hidden border-t border-white/10 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1 px-3 py-2 whitespace-nowrap">
          {links.map((l) => (
            <Link
              key={l.key}
              href={l.href}
              dir="auto"
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold shrink-0 transition ${
                active === l.key ? "bg-white/15 text-white" : "text-slate-300 hover:text-white bg-white/5"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
