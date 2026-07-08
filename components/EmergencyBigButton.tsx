"use client";

import { useEffect, useState } from "react";
import { Siren, X, ChevronDown } from "lucide-react";
import { COUNTRIES, COUNTRIES_ALPHABETICAL } from "@/lib/languages";
import { loadUserPrefs, saveUserPrefs, PREFS_EVENT } from "@/lib/userPrefs";
import { useUIStrings } from "@/lib/useUIStrings";
import { getNativeCountryName } from "@/lib/uiStrings";
import EmergencyHelplines from "@/components/EmergencyHelplines";

// The one button a panicking parent needs: huge, red, pulsing, localized.
// Tapping it opens the tap-to-call helplines for their country — no reading
// of menus, no navigation, works offline. A country selector lets them set
// their location so the numbers are correct (defaults from the chosen language).
export default function EmergencyBigButton() {
  const { t } = useUIStrings();
  const [open, setOpen] = useState(false);
  const [country, setCountry] = useState(COUNTRIES[0]);

  useEffect(() => {
    const sync = () => {
      const prefs = loadUserPrefs();
      if (prefs?.countryCode) {
        const c = COUNTRIES.find((c) => c.code === prefs.countryCode);
        if (c) setCountry(c);
      }
    };
    sync();
    // Keep in step when the country changes elsewhere (e.g. picking a language).
    window.addEventListener(PREFS_EVENT, sync);
    return () => window.removeEventListener(PREFS_EVENT, sync);
  }, []);

  const chooseCountry = (code: string) => {
    const c = COUNTRIES.find((c) => c.code === code);
    if (!c) return;
    setCountry(c);
    // An explicit choice — remember it and stop language picks from overriding.
    saveUserPrefs({
      countryCode: c.code,
      countryExplicit: true,
      location: { name: c.capital, country: c.name, lat: c.lat, lon: c.lon, displayName: `${c.capital}, ${c.name}` },
    });
  };

  return (
    <div className="max-w-2xl mx-auto w-full">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-center gap-3 rounded-2xl px-6 py-5 text-white font-black text-lg sm:text-2xl tracking-tight transition shadow-xl shadow-red-900/40 border-2 ${
          open
            ? "bg-red-700 border-red-400"
            : "bg-red-600 hover:bg-red-500 border-red-400 animate-pulse"
        }`}
      >
        {open ? <X className="w-7 h-7 shrink-0" /> : <Siren className="w-7 h-7 shrink-0" />}
        <span dir="auto">🚨 {t.emergencyNow}</span>
      </button>
      <p className="text-center text-sm text-red-200 mt-2 font-medium" dir="auto">
        {t.tapToCall} · {t.worksOffline}
      </p>
      {open && (
        <div className="mt-4 text-left space-y-3">
          {/* Country selector — the emergency numbers are for this country */}
          <div className="relative">
            <label dir="auto" className="sr-only">{t.country}</label>
            <select
              value={country.code}
              onChange={(e) => chooseCountry(e.target.value)}
              aria-label={t.country}
              className="w-full appearance-none bg-white/10 border-2 border-white/25 text-white text-base font-semibold rounded-xl pl-4 pr-10 py-3 focus:outline-none focus:border-red-400"
            >
              {COUNTRIES_ALPHABETICAL.map((c) => (
                <option key={c.code} value={c.code} className="text-slate-900">
                  {c.flag} {getNativeCountryName(c.code, c.name)}
                </option>
              ))}
            </select>
            <ChevronDown className="w-5 h-5 text-slate-300 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
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
