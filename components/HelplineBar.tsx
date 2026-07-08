"use client";

import { useState, useEffect } from "react";
import { Siren, ChevronDown, X } from "lucide-react";
import { COUNTRIES, COUNTRIES_ALPHABETICAL } from "@/lib/languages";
import { getNativeCountryName } from "@/lib/uiStrings";
import { loadUserPrefs, saveUserPrefs } from "@/lib/userPrefs";
import { useUIStrings } from "@/lib/useUIStrings";
import EmergencyHelplines from "@/components/EmergencyHelplines";
import LanguagePicker from "@/components/LanguagePicker";

export default function HelplineBar() {
  const { t } = useUIStrings();
  const [open, setOpen] = useState(false);
  const [country, setCountry] = useState(COUNTRIES[0]);

  // Sync the helpline country with the shared personalization store so a
  // choice made anywhere (dashboard, health) is reflected here, and vice versa.
  useEffect(() => {
    const prefs = loadUserPrefs();
    if (prefs?.countryCode) {
      const c = COUNTRIES.find((c) => c.code === prefs.countryCode);
      if (c) setCountry(c);
    }
  }, []);

  return (
    <div className="bg-[#0f2844] border-b border-blue-900/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3 flex-wrap">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2.5 bg-red-600 hover:bg-red-500 text-white px-5 py-3 rounded-xl text-base font-extrabold transition shadow-md border border-red-400"
        >
          <Siren className="w-5 h-5" />
          <span dir="auto">{t.emergencyNumbers}</span>
          {open ? <X className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
        </button>
        <span className="text-xs text-slate-300 hidden sm:inline" dir="auto">
          {t.tapToCall} · {t.worksOffline}
        </span>
        <div className="ml-auto flex items-center gap-2 flex-wrap">
          <LanguagePicker theme="dark" />
          <div className="relative">
            <select
              value={country.code}
              onChange={(e) => {
                const next = COUNTRIES.find((c) => c.code === e.target.value);
                if (next) {
                  setCountry(next);
                  saveUserPrefs({
                    countryCode: next.code,
                    location: {
                      name: next.capital,
                      country: next.name,
                      lat: next.lat,
                      lon: next.lon,
                      displayName: `${next.capital}, ${next.name}`,
                    },
                  });
                }
              }}
              aria-label={t.country}
              className="appearance-none bg-white/10 border border-white/20 text-white text-xs rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:border-blue-400"
            >
              {COUNTRIES_ALPHABETICAL.map((c) => (
                <option key={c.code} value={c.code} className="text-slate-900">
                  {c.flag} {getNativeCountryName(c.code, c.name)}
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
