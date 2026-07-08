// Lightweight, client-only personalization store. Remembers the parent's
// last country, location, language, and child details in localStorage so they
// don't re-enter everything each visit — critical when reopening the app during
// an emergency. No account, no backend: safe and works offline.
//
// A change event ("climaguard:prefs-changed") fires on every write so that any
// mounted page (nav language, dashboard, health advisor) re-syncs live — e.g.
// setting the active child in "My Children" updates every tool immediately.

import type { LocationResult } from "@/components/LocationPicker";

export const PREFS_EVENT = "climaguard:prefs-changed";

export type UserPrefs = {
  countryCode?: string;
  location?: LocationResult;
  language?: string;
  childAge?: string;
  childName?: string;
  childConditions?: string;
  // True once the parent has actively chosen a country (emergency selector,
  // dashboard, profile…). Until then, picking a language sets a default country.
  countryExplicit?: boolean;
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
    // Notify mounted pages so personalization syncs everywhere without a reload.
    window.dispatchEvent(new Event(PREFS_EVENT));
  } catch {
    // Storage full or unavailable (private mode) — personalization is best-effort.
  }
}

// A stable signature of the personalization fields, used by pages to detect a
// real change (e.g. from "My Children") and avoid re-applying their own writes.
export function prefsSignature(p: UserPrefs | null): string {
  if (!p) return "";
  return JSON.stringify([
    p.countryCode ?? "", p.location?.displayName ?? "", p.language ?? "",
    p.childAge ?? "", p.childName ?? "", p.childConditions ?? "",
  ]);
}
