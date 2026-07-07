"use client";

import { useState, useEffect } from "react";
import { WifiOff, ChevronDown, Phone } from "lucide-react";
import { OFFLINE_GUIDANCE, ageToBand, AGE_BAND_LABEL } from "@/lib/offlineGuidance";
import { getLanguageCode } from "@/lib/languages";
import { loadUserPrefs } from "@/lib/userPrefs";
import SpeakButton from "./SpeakButton";

type Props = {
  childAge: string;
  langCode?: string;
};

/**
 * Always-available first-response guide bundled in the app. Works with zero
 * network on first use — the standout offline capability. See feature #3.
 */
export default function OfflineGuidancePacks({ childAge, langCode }: Props) {
  const [open, setOpen] = useState<string | null>(null);
  // Personalize from saved prefs (age band + read-aloud language) when available.
  const [age, setAge] = useState(childAge);
  const [effectiveLang, setEffectiveLang] = useState(langCode);

  useEffect(() => {
    const prefs = loadUserPrefs();
    if (prefs?.childAge) setAge(prefs.childAge);
    if (prefs?.language) setEffectiveLang(getLanguageCode(prefs.language));
  }, []);

  const band = ageToBand(age);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2.5">
        <div className="w-8 h-8 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-center">
          <WifiOff className="w-4 h-4 text-emerald-600" />
        </div>
        <div>
          <h2 className="font-semibold text-slate-900 text-sm">Offline Emergency Guide</h2>
          <p className="text-xs text-slate-400">
            Works with no internet · Tailored for {AGE_BAND_LABEL[band]}
          </p>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {OFFLINE_GUIDANCE.map((pack) => {
          const isOpen = open === pack.hazard;
          const steps = pack.steps[band];
          const speakText = `${pack.hazard}. ${steps.join(". ")}. Seek emergency care if: ${pack.callNow.join(", ")}.`;
          return (
            <div key={pack.hazard}>
              <button
                onClick={() => setOpen(isOpen ? null : pack.hazard)}
                className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-slate-50 transition"
              >
                <span className="text-xl">{pack.icon}</span>
                <span className="font-semibold text-slate-800 text-sm flex-1">{pack.hazard}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition ${isOpen ? "rotate-180" : ""}`} />
              </button>
              {isOpen && (
                <div className="px-5 pb-4 pt-1">
                  <div className="mb-3">
                    <SpeakButton text={speakText} langCode={effectiveLang} label="Read this aloud" />
                  </div>
                  <ol className="space-y-1.5 mb-3">
                    {steps.map((s, i) => (
                      <li key={i} className="flex gap-2.5 text-sm text-slate-700 leading-relaxed">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        {s}
                      </li>
                    ))}
                  </ol>
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-red-700 uppercase tracking-wide mb-1.5">
                      <Phone className="w-3.5 h-3.5" /> Call emergency services if
                    </div>
                    <ul className="space-y-1">
                      {pack.callNow.map((c, i) => (
                        <li key={i} className="text-xs text-red-800 leading-snug">• {c}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
