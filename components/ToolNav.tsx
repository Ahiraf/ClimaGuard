"use client";

import Link from "next/link";
import { Shield } from "lucide-react";
import LanguagePicker from "./LanguagePicker";
import { useUIStrings } from "@/lib/useUIStrings";

// One consistent top nav for every tool page (dashboard, health, photo, map),
// so a parent can jump directly between tools. Layout is overlap-proof at every
// width: the logo is pinned left, the language selector pinned right, and the
// tool links live in a horizontally-scrollable strip in between — so long
// non-English labels never collide with the language picker.
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
      <div className="max-w-6xl mx-auto pl-3 pr-2 sm:px-6 py-2.5 flex items-center gap-2 sm:gap-3">
        {/* Logo — pinned left */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Shield className="text-blue-300 w-5 h-5" />
          <span className="text-base sm:text-lg font-bold text-white tracking-tight hidden sm:inline">ClimaGuard</span>
        </Link>

        {/* Tool links — scroll horizontally in the space that's left */}
        <div className="flex-1 min-w-0 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-0.5 w-max">
            {links.map((l) => (
              <Link
                key={l.key}
                href={l.href}
                dir="auto"
                className={`text-sm px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap ${
                  active === l.key ? "bg-white/15 text-white" : "text-slate-200 hover:text-white hover:bg-white/10"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Language selector — pinned right, never overlapped */}
        <div className="shrink-0">
          <LanguagePicker theme="dark" />
        </div>
      </div>
    </nav>
  );
}
