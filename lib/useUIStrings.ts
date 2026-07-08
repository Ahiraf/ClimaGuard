"use client";

// Shared UI-language state. The chosen language lives in userPrefs (the same
// `language` field the AI already uses), so picking "বাংলা" once localizes both
// the interface chrome AND every AI response. On the very first visit, the
// phone's own language is auto-detected — a parent who cannot read English
// never has to find the selector to escape an English screen.

import { useEffect, useState, useCallback } from "react";
import { SUPPORTED_LANGUAGES, getLanguageCode } from "@/lib/languages";
import { getUIStrings, isRTL, type UIStrings } from "@/lib/uiStrings";
import { loadUserPrefs, saveUserPrefs } from "@/lib/userPrefs";

const PREFS_EVENT = "climaguard:prefs-changed";

export function useUIStrings(): {
  t: UIStrings;
  langName: string;
  langCode: string;
  rtl: boolean;
  setUILanguage: (name: string) => void;
} {
  // Render English on the server / first paint, then swap after hydration.
  const [langName, setLangName] = useState("English");

  useEffect(() => {
    const applyFromPrefs = () => {
      const prefs = loadUserPrefs();
      if (prefs?.language) setLangName(prefs.language);
    };

    const prefs = loadUserPrefs();
    if (prefs?.language) {
      setLangName(prefs.language);
    } else {
      // First visit: match the phone's language (e.g. a phone set up in Bangla
      // by a relative) so the app opens readable, not in English.
      const detected = (navigator.languages ?? [navigator.language])
        .map((l) => l?.toLowerCase().split("-")[0])
        .map((code) => SUPPORTED_LANGUAGES.find((s) => s.code === code))
        .find(Boolean);
      if (detected) {
        setLangName(detected.name);
        saveUserPrefs({ language: detected.name });
      }
    }

    window.addEventListener(PREFS_EVENT, applyFromPrefs);
    return () => window.removeEventListener(PREFS_EVENT, applyFromPrefs);
  }, []);

  const setUILanguage = useCallback((name: string) => {
    setLangName(name);
    saveUserPrefs({ language: name });
    window.dispatchEvent(new Event(PREFS_EVENT));
  }, []);

  const langCode = getLanguageCode(langName);
  return { t: getUIStrings(langCode), langName, langCode, rtl: isRTL(langCode), setUILanguage };
}
