"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, Square, Loader2 } from "lucide-react";
import { getLanguageName } from "@/lib/languages";
import { getCachedAudio, putCachedAudio, ttsKey } from "@/lib/ttsCache";

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

// Cache synthesized audio across the session so replaying (or re-mounting) a
// passage is instant and never re-costs an API call. Keyed by language + text.
const audioCache = new Map<string, string>(); // key → object URL

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
 * Reads guidance aloud. When online it uses a neural multilingual voice
 * (/api/tts) so languages like Bengali are fluent and correctly pronounced;
 * when offline (or if that fails) it falls back to the browser's built-in
 * SpeechSynthesis voice so read-aloud still works with zero network. Critical
 * for low-literacy parents who cannot read the on-screen plan. See feature #1.
 */
export default function SpeakButton({ text, langCode, label = "Read aloud", className = "" }: Props) {
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  // Guards the sequential browser-voice queue so Stop doesn't resume.
  const cancelledRef = useRef(false);
  // The currently-playing neural-audio element, so Stop can halt it.
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const speech = typeof window !== "undefined" && "speechSynthesis" in window;
    // Neural audio only needs an <audio> element; the browser voice is a bonus.
    setSupported(typeof window !== "undefined");
    if (!speech) return;
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

  const finish = () => {
    setSpeaking(false);
    setLoading(false);
  };

  const stop = () => {
    cancelledRef.current = true;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    finish();
  };

  // Fallback: the browser's offline voice, read sentence by sentence.
  const speakWithBrowser = () => {
    if (!("speechSynthesis" in window)) return finish();
    window.speechSynthesis.cancel();
    const voice = pickVoice(voices, locale);
    const parts = chunk(text);
    if (!parts.length) return finish();
    setLoading(false);
    setSpeaking(true);
    const speakAt = (i: number) => {
      if (cancelledRef.current || i >= parts.length) {
        if (!cancelledRef.current) finish();
        return;
      }
      const utter = new SpeechSynthesisUtterance(parts[i]);
      utter.lang = voice?.lang || locale;
      if (voice) utter.voice = voice;
      utter.rate = 0.9;
      utter.onend = () => speakAt(i + 1);
      utter.onerror = () => speakAt(i + 1);
      window.speechSynthesis.speak(utter);
    };
    speakAt(0);
  };

  // Play cached/neural audio; return true on success, false to fall back.
  // Lookup order: in-memory (this session) → IndexedDB (persists, works offline)
  // → network (/api/tts), which we then store for next time / offline use.
  const playNeural = async (): Promise<boolean> => {
    const key = ttsKey(langCode ?? "en", text);
    let url = audioCache.get(key);
    if (!url) {
      const persisted = await getCachedAudio(key);
      if (persisted) {
        url = URL.createObjectURL(persisted);
        audioCache.set(key, url);
      }
    }
    if (!url) {
      if (typeof navigator !== "undefined" && navigator.onLine === false) return false;
      try {
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, language: getLanguageName(langCode ?? "en") }),
        });
        if (!res.ok) return false;
        const blob = await res.blob();
        if (!blob.size) return false;
        void putCachedAudio(key, blob); // persist for offline replays
        url = URL.createObjectURL(blob);
        audioCache.set(key, url);
      } catch {
        return false;
      }
    }
    if (cancelledRef.current) return true; // user hit Stop while fetching
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.onended = () => { audioRef.current = null; finish(); };
    audio.onerror = () => { audioRef.current = null; if (!cancelledRef.current) speakWithBrowser(); };
    setLoading(false);
    setSpeaking(true);
    try {
      await audio.play();
      return true;
    } catch {
      return false;
    }
  };

  const speak = async () => {
    cancelledRef.current = false;
    setLoading(true);
    const ok = await playNeural();
    if (!ok && !cancelledRef.current) speakWithBrowser();
  };

  const busy = speaking || loading;

  return (
    <button
      onClick={busy ? stop : speak}
      title={busy ? "Stop" : label}
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${
        speaking
          ? "bg-red-500 text-white border-red-500"
          : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
      } ${className}`}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : speaking ? (
        <Square className="w-3.5 h-3.5" />
      ) : (
        <Volume2 className="w-3.5 h-3.5" />
      )}
      {loading ? "…" : speaking ? "Stop" : label}
    </button>
  );
}
