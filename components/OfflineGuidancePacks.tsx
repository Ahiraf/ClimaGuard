"use client";

import { useState, useEffect } from "react";
import { WifiOff, ChevronDown, Phone, Loader2 } from "lucide-react";
import { OFFLINE_GUIDANCE, ageToBand, AGE_BAND_LABEL, AgeBand } from "@/lib/offlineGuidance";
import { loadUserPrefs } from "@/lib/userPrefs";
import { useUIStrings } from "@/lib/useUIStrings";
import { getLanguageName } from "@/lib/languages";
import { prefetchAudio } from "@/lib/ttsCache";
import SpeakButton from "./SpeakButton";

type Props = {
  childAge: string;
  langCode?: string;
};

// Shape the translate endpoint returns (and we cache). Mirrors the English base.
type GuidanceContent = {
  title: string;
  worksLabel: string;
  readAloud: string;
  callHeading: string;
  seekCareLead: string;
  bands: Record<AgeBand, string>;
  packs: {
    hazard: string;
    icon: string;
    steps: Record<AgeBand, string[]>;
    callNow: string[];
  }[];
};

const CACHE_PREFIX = "climaguard_offline_guide_v1_";

// English baseline — always available, works fully offline on first launch.
function englishContent(): GuidanceContent {
  return {
    title: "Offline Emergency Guide",
    worksLabel: "Works with no internet",
    readAloud: "Read this aloud",
    callHeading: "Call emergency services if",
    seekCareLead: "Seek emergency care if",
    bands: { ...AGE_BAND_LABEL },
    packs: OFFLINE_GUIDANCE.map((p) => ({
      hazard: p.hazard,
      icon: p.icon,
      steps: p.steps,
      callNow: p.callNow,
    })),
  };
}

/**
 * Always-available first-response guide bundled in the app. It ships in English
 * so it opens with zero network on the very first launch. When the parent has
 * picked another language, we fetch a translated copy once and cache it in
 * localStorage — so the guide AND its read-aloud then work in their language,
 * even offline afterwards. See feature #3.
 */
export default function OfflineGuidancePacks({ childAge, langCode }: Props) {
  const { langName, langCode: uiLangCode } = useUIStrings();
  const [open, setOpen] = useState<string | null>(null);
  const [age, setAge] = useState(childAge);
  const [content, setContent] = useState<GuidanceContent>(englishContent);
  const [translating, setTranslating] = useState(false);

  // The read-aloud voice should match whatever text is on screen.
  const effectiveCode = langCode ?? uiLangCode;

  useEffect(() => {
    const prefs = loadUserPrefs();
    if (prefs?.childAge) setAge(prefs.childAge);
  }, []);

  // Load the guide in the selected language: English baseline → cache → fetch.
  useEffect(() => {
    let cancelled = false;
    const base = englishContent();

    if (effectiveCode === "en") {
      setContent(base);
      setTranslating(false);
      return;
    }

    // Show English immediately so the guide is never blank/blocked…
    setContent(base);

    const cacheKey = CACHE_PREFIX + effectiveCode;
    try {
      const cached = typeof window !== "undefined" ? window.localStorage.getItem(cacheKey) : null;
      if (cached) {
        const parsed = JSON.parse(cached) as GuidanceContent;
        // Re-attach icons (not translated / not stored redundantly per pack).
        parsed.packs = parsed.packs.map((p, i) => ({ ...p, icon: base.packs[i]?.icon ?? p.icon }));
        setContent(parsed);
        setTranslating(false);
        return;
      }
    } catch { /* fall through to fetch */ }

    // …then fetch a translation in the background (needs network once).
    setTranslating(true);
    (async () => {
      try {
        const res = await fetch("/api/translate-guidance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            language: langName,
            payload: {
              title: base.title,
              worksLabel: base.worksLabel,
              readAloud: base.readAloud,
              callHeading: base.callHeading,
              seekCareLead: base.seekCareLead,
              bands: base.bands,
              packs: base.packs.map((p) => ({ hazard: p.hazard, steps: p.steps, callNow: p.callNow })),
            },
          }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (data.translated) {
          const merged: GuidanceContent = {
            ...data.translated,
            packs: data.translated.packs.map((p: GuidanceContent["packs"][number], i: number) => ({
              ...p,
              icon: base.packs[i]?.icon ?? "",
            })),
          };
          setContent(merged);
          try { window.localStorage.setItem(cacheKey, JSON.stringify(data.translated)); } catch { /* storage full */ }
        }
        // On any failure we simply keep the English baseline already shown.
      } catch {
        /* offline or error — English baseline stays */
      } finally {
        if (!cancelled) setTranslating(false);
      }
    })();

    return () => { cancelled = true; };
  }, [effectiveCode, langName]);

  const band = ageToBand(age);

  // Warm the neural read-aloud cache while online so every hazard's audio plays
  // in the clear native voice even offline. English uses the browser voice fine,
  // so we only pre-fetch for translated languages (where the offline voice is
  // the weak point). Runs quietly in the background, one clip at a time.
  useEffect(() => {
    if (effectiveCode === "en") return;
    if (typeof navigator !== "undefined" && navigator.onLine === false) return;
    let cancelled = false;
    (async () => {
      const language = getLanguageName(effectiveCode);
      for (const pack of content.packs) {
        if (cancelled) return;
        const steps = pack.steps[band];
        if (!steps?.length) continue;
        // Must match SpeakButton's speakText exactly so the cache keys line up.
        const speakText = `${pack.hazard}. ${steps.join(". ")}. ${content.seekCareLead}: ${pack.callNow.join(", ")}.`;
        await prefetchAudio(effectiveCode, speakText, language);
      }
    })();
    return () => { cancelled = true; };
  }, [content, band, effectiveCode]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2.5">
        <div className="w-8 h-8 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-center shrink-0">
          <WifiOff className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="min-w-0">
          <h2 dir="auto" className="font-semibold text-slate-900 text-sm">{content.title}</h2>
          <p dir="auto" className="text-xs text-slate-400">
            {content.worksLabel} · {content.bands[band]}
          </p>
        </div>
        {translating && (
          <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-blue-600 shrink-0">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> …
          </span>
        )}
      </div>

      <div className="divide-y divide-slate-100">
        {content.packs.map((pack) => {
          const isOpen = open === pack.hazard;
          const steps = pack.steps[band];
          const speakText = `${pack.hazard}. ${steps.join(". ")}. ${content.seekCareLead}: ${pack.callNow.join(", ")}.`;
          return (
            <div key={pack.icon || pack.hazard}>
              <button
                onClick={() => setOpen(isOpen ? null : pack.hazard)}
                className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-slate-50 transition"
              >
                <span className="text-xl shrink-0">{pack.icon}</span>
                <span dir="auto" className="font-semibold text-slate-800 text-sm flex-1">{pack.hazard}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition shrink-0 ${isOpen ? "rotate-180" : ""}`} />
              </button>
              {isOpen && (
                <div className="px-5 pb-4 pt-1">
                  <div className="mb-3">
                    <SpeakButton text={speakText} langCode={effectiveCode} label={content.readAloud} />
                  </div>
                  <ol className="space-y-1.5 mb-3">
                    {steps.map((s, i) => (
                      <li key={i} dir="auto" className="flex gap-2.5 text-sm text-slate-700 leading-relaxed">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        {s}
                      </li>
                    ))}
                  </ol>
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                    <div dir="auto" className="flex items-center gap-1.5 text-xs font-bold text-red-700 uppercase tracking-wide mb-1.5">
                      <Phone className="w-3.5 h-3.5 shrink-0" /> {content.callHeading}
                    </div>
                    <ul className="space-y-1">
                      {pack.callNow.map((c, i) => (
                        <li key={i} dir="auto" className="text-xs text-red-800 leading-snug">• {c}</li>
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
