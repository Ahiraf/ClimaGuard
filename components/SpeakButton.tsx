"use client";

import { useEffect, useRef, useState } from "react";
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

// getVoices() is empty until the engine finishes loading, so we listen for
// `voiceschanged` and re-read. Returns the current list (may be empty early).
function loadVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
  return window.speechSynthesis.getVoices();
}

// Pick the clearest installed voice for a locale: exact tag first (bn-IN), then
// any voice for the base language (bn-*), else null so we keep the default.
function pickVoice(voices: SpeechSynthesisVoice[], locale: string): SpeechSynthesisVoice | null {
  if (!voices.length) return null;
  const want = locale.toLowerCase();
  const base = want.split("-")[0];
  const norm = (v: SpeechSynthesisVoice) => v.lang.toLowerCase().replace("_", "-");
  return (
    voices.find((v) => norm(v) === want) ||
    voices.find((v) => norm(v).startsWith(base + "-")) ||
    voices.find((v) => norm(v) === base) ||
    null
  );
}

// Split guidance into short, sentence-sized pieces. Long single utterances are
// unreliable (Chrome silently stops after ~15s), and per-sentence pauses make
// the read-aloud clearer and easier to follow for a low-literacy listener.
function chunk(text: string): string[] {
  return text
    .split(/(?<=[.!?。．！？।॥…])\s+|\n+/u)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Reads guidance aloud using the browser SpeechSynthesis API — no network, no
 * API key, works offline. Critical for low-literacy parents who cannot read the
 * on-screen action plan. See feature #1.
 */
export default function SpeakButton({ text, langCode, label = "Read aloud", className = "" }: Props) {
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  // Guards the sequential queue so a Stop mid-read doesn't resume.
  const cancelledRef = useRef(false);

  useEffect(() => {
    const ok = typeof window !== "undefined" && "speechSynthesis" in window;
    setSupported(ok);
    if (!ok) return;
    const refresh = () => setVoices(loadVoices());
    refresh();
    window.speechSynthesis.addEventListener("voiceschanged", refresh);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", refresh);
      window.speechSynthesis.cancel();
    };
  }, []);

  if (!supported || !text?.trim()) return null;

  const locale = (langCode && LANG_MAP[langCode]) || langCode || "en-US";
  const voice = pickVoice(voices, locale);

  const stop = () => {
    cancelledRef.current = true;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  const speak = () => {
    window.speechSynthesis.cancel();
    cancelledRef.current = false;
    const parts = chunk(text);
    if (!parts.length) return;
    setSpeaking(true);

    // Speak sentence by sentence so long guidance never gets cut off, and each
    // utterance carries the chosen native voice for a clear, correct accent.
    const speakAt = (i: number) => {
      if (cancelledRef.current || i >= parts.length) {
        if (!cancelledRef.current) setSpeaking(false);
        return;
      }
      const utter = new SpeechSynthesisUtterance(parts[i]);
      utter.lang = voice?.lang || locale;
      if (voice) utter.voice = voice;
      // Slightly slower than default helps non-Latin scripts stay intelligible.
      utter.rate = 0.9;
      utter.pitch = 1;
      utter.onend = () => speakAt(i + 1);
      utter.onerror = () => speakAt(i + 1);
      window.speechSynthesis.speak(utter);
    };
    speakAt(0);
  };

  // If the device has no voice at all for this language, the browser will read
  // it with a default (usually English) voice — sounding garbled. Warn quietly.
  const noNativeVoice = voices.length > 0 && !voice && locale !== "en-US" && !locale.startsWith("en");

  return (
    <button
      onClick={speaking ? stop : speak}
      title={speaking ? "Stop" : noNativeVoice ? "Your device has no voice for this language yet" : label}
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
