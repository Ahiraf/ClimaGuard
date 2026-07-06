"use client";

import { useEffect, useState } from "react";
import { Volume2, Square } from "lucide-react";

type Props = {
  text: string;
  /** BCP-47-ish language code, e.g. "bn", "hi", "ar". Falls back to browser default. */
  langCode?: string;
  label?: string;
  className?: string;
};

// Some languageCodes from lib/languages.ts aren't standalone BCP-47 tags that
// browsers reliably recognise — map them to the closest speakable locale.
const LANG_MAP: Record<string, string> = {
  bn: "bn-IN",
  hi: "hi-IN",
  ur: "ur-PK",
  ar: "ar-SA",
  fr: "fr-FR",
  sw: "sw-KE",
  am: "am-ET",
  so: "so-SO",
  ha: "ha-NG",
  fil: "fil-PH",
  id: "id-ID",
  es: "es-ES",
  my: "my-MM",
  prs: "fa-AF", // Dari → Persian (Afghanistan)
  tpi: "en-AU", // Tok Pisin has no TTS voice → English fallback
  mg: "fr-FR", // Malagasy has no TTS voice → French fallback
  en: "en-US",
};

/**
 * Reads guidance aloud using the browser SpeechSynthesis API — no network, no
 * API key, works offline. Critical for low-literacy parents who cannot read the
 * on-screen action plan. See feature #1.
 */
export default function SpeakButton({ text, langCode, label = "Read aloud", className = "" }: Props) {
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!supported || !text?.trim()) return null;

  const stop = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  const speak = () => {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = (langCode && LANG_MAP[langCode]) || langCode || "en-US";
    utter.rate = 0.95;
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utter);
  };

  return (
    <button
      onClick={speaking ? stop : speak}
      title={speaking ? "Stop" : label}
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${
        speaking
          ? "bg-red-500 text-white border-red-500"
          : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
      } ${className}`}
    >
      {speaking ? <Square className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
      {speaking ? "Stop" : label}
    </button>
  );
}
