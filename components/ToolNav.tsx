"use client";

import Link from "next/link";
import { Shield } from "lucide-react";
import LanguagePicker from "./LanguagePicker";
import { useUIStrings } from "@/lib/useUIStrings";

// One consistent top nav for every tool page (dashboard, health, photo, map),
// so a parent can jump directly between tools. Two rows so nothing is cut off:
// logo + language selector on top, the tool links (current one highlighted) on
// their own full-width row below, wrapping as needed.
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <Shield className="text-blue-300 w-5 h-5" />
            <span className="text-lg font-bold text-white tracking-tight">ClimaGuard</span>
          </Link>
          <LanguagePicker theme="dark" />
        </div>
        <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
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
    </nav>
  );
}
