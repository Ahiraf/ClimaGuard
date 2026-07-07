"use client";

import { useState } from "react";
import { Siren, ChevronDown, X } from "lucide-react";
import { COUNTRIES, COUNTRIES_ALPHABETICAL } from "@/lib/languages";
import EmergencyHelplines from "@/components/EmergencyHelplines";

export default function HelplineBar() {
  const [open, setOpen] = useState(false);
  const [country, setCountry] = useState(COUNTRIES[0]);

  return (
    <div className="bg-[#0f2844] border-b border-blue-900/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-3 flex-wrap">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition shadow-sm"
        >
          <Siren className="w-4 h-4" />
          Emergency Helplines
          {open ? <X className="w-3.5 h-3.5 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 ml-1" />}
        </button>
        <span className="text-xs text-slate-300 hidden sm:inline">
          Tap to view local emergency numbers · Works offline
        </span>
        <div className="ml-auto flex items-center gap-2">
          <label className="text-[11px] text-slate-400 uppercase tracking-wider hidden sm:inline">Country</label>
          <div className="relative">
            <select
              value={country.code}
              onChange={(e) => {
                const next = COUNTRIES.find((c) => c.code === e.target.value);
                if (next) setCountry(next);
              }}
              className="appearance-none bg-white/10 border border-white/20 text-white text-xs rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:border-blue-400"
            >
              {COUNTRIES_ALPHABETICAL.map((c) => (
                <option key={c.code} value={c.code} className="text-slate-900">
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-300 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {open && (
        <div className="max-w-6xl mx-auto px-6 pb-4 pt-1">
          <EmergencyHelplines
            countryCode={country.code}
            countryName={country.name}
            flag={country.flag}
            theme="dark"
          />
        </div>
      )}
    </div>
  );
}
