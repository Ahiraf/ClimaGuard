"use client";

import { useEffect, useState } from "react";
import { Siren, X } from "lucide-react";
import { COUNTRIES } from "@/lib/languages";
import { loadUserPrefs } from "@/lib/userPrefs";
import { useUIStrings } from "@/lib/useUIStrings";
import EmergencyHelplines from "@/components/EmergencyHelplines";

// The one button a panicking parent needs: huge, red, pulsing, localized.
// Tapping it opens the tap-to-call helplines for their country — no reading
// of menus, no navigation, works offline.
export default function EmergencyBigButton() {
  const { t } = useUIStrings();
  const [open, setOpen] = useState(false);
  const [country, setCountry] = useState(COUNTRIES[0]);

  useEffect(() => {
    const prefs = loadUserPrefs();
    if (prefs?.countryCode) {
      const c = COUNTRIES.find((c) => c.code === prefs.countryCode);
      if (c) setCountry(c);
    }
  }, []);

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
        <div className="mt-4 text-left">
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
