// Lightweight, client-only personalization store. Remembers the parent's
// last country, location, language, and child details in localStorage so they
// don't re-enter everything each visit — critical when reopening the app during
// an emergency. No account, no backend: safe and works offline.

import type { LocationResult } from "@/components/LocationPicker";

export type UserPrefs = {
  countryCode?: string;
  location?: LocationResult;
  language?: string;
  childAge?: string;
  childName?: string;
};

const KEY = "climaguard_prefs";

export function loadUserPrefs(): UserPrefs | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as UserPrefs) : null;
  } catch {
    return null;
  }
}

export function saveUserPrefs(patch: Partial<UserPrefs>): void {
  if (typeof window === "undefined") return;
  try {
    const current = loadUserPrefs() ?? {};
    window.localStorage.setItem(KEY, JSON.stringify({ ...current, ...patch }));
  } catch {
    // Storage full or unavailable (private mode) — personalization is best-effort.
  }
}
