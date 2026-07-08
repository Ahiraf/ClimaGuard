"use client";

// Shared UI-language state. The chosen language lives in userPrefs (the same
// `language` field the AI already uses), so picking "বাংলা" once localizes both
// the interface chrome AND every AI response. On the very first visit, the
// phone's own language is auto-detected.
//
// Coverage: 23 hand-written + 6 AI-generated languages are bundled statically
// (instant, offline). The remaining selectable languages are translated once on
// demand via /api/translate-ui and cached in localStorage, so every one of the
// 55 languages localizes the whole interface — the first load shows English for
// a moment, then swaps and is instant/offline afterwards.

import { useEffect, useState, useCallback } from "react";
import { SUPPORTED_LANGUAGES, getLanguageCode, countryForLanguage } from "@/lib/languages";
import {
  getUIStrings, isRTL, hasStaticUI, RUNTIME_UI, type UIStrings,
} from "@/lib/uiStrings";
import { getProfileStrings, RUNTIME_PROFILE, type ProfileStrings } from "@/lib/profileStrings";
import { loadUserPrefs, saveUserPrefs } from "@/lib/userPrefs";

const PREFS_EVENT = "climaguard:prefs-changed";
const RUNTIME_EVENT = "climaguard:ui-runtime-updated";
const CACHE_PREFIX = "climaguard_ui_v1_";

const inFlight = new Set<string>();

// Load a language's UI+profile strings from localStorage into the runtime maps.
function hydrateFromCache(code: string): boolean {
  if (RUNTIME_UI[code]) return true;
  try {
    const raw = window.localStorage.getItem(CACHE_PREFIX + code);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { ui: UIStrings; profile: ProfileStrings };
    if (parsed?.ui) {
      RUNTIME_UI[code] = parsed.ui;
      if (parsed.profile) RUNTIME_PROFILE[code] = parsed.profile;
      return true;
    }
  } catch { /* ignore */ }
  return false;
}

// Fetch a translation for a not-yet-bundled language, cache it, and notify.
function ensureRuntime(code: string, langName: string): void {
  if (hasStaticUI(code) || inFlight.has(code)) return;
  if (hydrateFromCache(code)) { window.dispatchEvent(new Event(RUNTIME_EVENT)); return; }
  inFlight.add(code);
  (async () => {
    try {
      const res = await fetch("/api/translate-ui", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: langName }),
      });
      const data = await res.json();
      if (data?.ui) {
        RUNTIME_UI[code] = data.ui;
        if (data.profile) RUNTIME_PROFILE[code] = data.profile;
        try { window.localStorage.setItem(CACHE_PREFIX + code, JSON.stringify({ ui: data.ui, profile: data.profile })); } catch { /* full */ }
        window.dispatchEvent(new Event(RUNTIME_EVENT));
      }
    } catch { /* offline / error — English stays */ }
    finally { inFlight.delete(code); }
  })();
}

export function useUIStrings(): {
  t: UIStrings;
  p: ProfileStrings;
  langName: string;
  langCode: string;
  rtl: boolean;
  setUILanguage: (name: string) => void;
} {
  // Render English on the server / first paint, then swap after hydration.
  const [langName, setLangName] = useState("English");
  // Bump to force re-render when a runtime translation arrives.
  const [, setTick] = useState(0);

  useEffect(() => {
    const applyFromPrefs = () => {
      const prefs = loadUserPrefs();
      if (prefs?.language) setLangName(prefs.language);
    };
    const bump = () => setTick((n) => n + 1);

    const prefs = loadUserPrefs();
    if (prefs?.language) {
      setLangName(prefs.language);
    } else {
      // First visit: match the phone's language so the app opens readable.
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
    window.addEventListener(RUNTIME_EVENT, bump);
    return () => {
      window.removeEventListener(PREFS_EVENT, applyFromPrefs);
      window.removeEventListener(RUNTIME_EVENT, bump);
    };
  }, []);

  const langCode = getLanguageCode(langName);

  // Kick off (or reuse) a runtime translation for languages not bundled.
  useEffect(() => {
    if (typeof window !== "undefined" && !hasStaticUI(langCode)) {
      ensureRuntime(langCode, langName);
    }
  }, [langCode, langName]);

  const setUILanguage = useCallback((name: string) => {
    setLangName(name);
    // Picking a language also sets a sensible default country (so emergency
    // numbers match), but never overrides a country the parent chose themselves.
    const prefs = loadUserPrefs();
    const patch: Parameters<typeof saveUserPrefs>[0] = { language: name };
    if (!prefs?.countryExplicit) {
      const c = countryForLanguage(name);
      if (c) {
        patch.countryCode = c.code;
        patch.location = { name: c.capital, country: c.name, lat: c.lat, lon: c.lon, displayName: `${c.capital}, ${c.name}` };
      }
    }
    saveUserPrefs(patch);
  }, []);

  return {
    t: getUIStrings(langCode),
    p: getProfileStrings(langCode),
    langName,
    langCode,
    rtl: isRTL(langCode),
    setUILanguage,
  };
}
