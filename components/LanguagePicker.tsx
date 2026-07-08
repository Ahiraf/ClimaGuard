"use client";

import { Languages, ChevronDown } from "lucide-react";
import { SUPPORTED_LANGUAGES_ALPHABETICAL } from "@/lib/languages";
import { NATIVE_LANGUAGE_NAMES } from "@/lib/uiStrings";
import { useUIStrings } from "@/lib/useUIStrings";

// Language selector that stays findable even when the current UI language is
// unreadable: a universal 🌐 icon and every option written in its OWN script
// ("বাংলা", "العربية", "हिन्दी") — a parent scans for their alphabet, not for
// the English word "Language".
export default function LanguagePicker({ theme = "dark" }: { theme?: "dark" | "light" }) {
  const { langName, setUILanguage } = useUIStrings();
  const dark = theme === "dark";

  return (
    <div className="relative inline-flex items-center">
      <Languages className={`w-4 h-4 absolute left-2.5 pointer-events-none ${dark ? "text-blue-300" : "text-blue-600"}`} />
      <select
        value={langName}
        onChange={(e) => setUILanguage(e.target.value)}
        aria-label="ভাষা · Language · اللغة · भाषा"
        className={`appearance-none text-sm font-semibold rounded-lg pl-8 pr-7 py-2 focus:outline-none cursor-pointer ${
          dark
            ? "bg-white/10 border border-white/25 text-white focus:border-blue-400"
            : "bg-white border border-slate-200 text-slate-900 focus:ring-2 focus:ring-blue-500 shadow-sm"
        }`}
      >
        {SUPPORTED_LANGUAGES_ALPHABETICAL.map((l) => (
          <option key={l.code} value={l.name} className="text-slate-900">
            {NATIVE_LANGUAGE_NAMES[l.code] ?? l.name}
          </option>
        ))}
      </select>
      <ChevronDown className={`w-3.5 h-3.5 absolute right-2 pointer-events-none ${dark ? "text-slate-300" : "text-slate-400"}`} />
    </div>
  );
}
