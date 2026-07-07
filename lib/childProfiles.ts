// Multi-child profile store. A parent sets up each child once (age, country,
// language, health conditions); the active child drives personalization across
// every tool. Persisted to Firestore (cross-device, under the anonymous UID)
// with a localStorage cache so it still works fully offline.

import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db, ensureAnonymousAuth } from "./firebase";
import { saveUserPrefs } from "./userPrefs";
import { COUNTRIES } from "./languages";
import type { LocationResult } from "@/components/LocationPicker";

export type ChildProfile = {
  id: string;
  name: string;
  age: string;
  countryCode: string;
  location: LocationResult;
  language: string;
  healthConditions: string;
};

export type ProfilesState = {
  children: ChildProfile[];
  activeChildId?: string;
};

const KEY = "climaguard_children";
const EMPTY: ProfilesState = { children: [] };

export function newChildId(): string {
  return `child_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// Build a sensible default location from a country code (its capital).
export function locationForCountry(countryCode: string): LocationResult {
  const c = COUNTRIES.find((c) => c.code === countryCode) ?? COUNTRIES[0];
  return {
    name: c.capital,
    country: c.name,
    lat: c.lat,
    lon: c.lon,
    displayName: `${c.capital}, ${c.name}`,
  };
}

export function getActiveChild(state: ProfilesState): ChildProfile | undefined {
  return state.children.find((c) => c.id === state.activeChildId) ?? state.children[0];
}

// ---- localStorage cache ----
export function getProfilesLocal(): ProfilesState {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ProfilesState) : EMPTY;
  } catch {
    return EMPTY;
  }
}

function writeCache(state: ProfilesState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // best-effort
  }
}

// Push the active child's fields into userPrefs so every tool (dashboard,
// health, offline guide, helpline bar) personalizes with no page changes.
export function applyActiveChildToPrefs(state: ProfilesState): void {
  const child = getActiveChild(state);
  if (!child) return;
  saveUserPrefs({
    countryCode: child.countryCode,
    location: child.location,
    language: child.language,
    childAge: child.age,
    childName: child.name,
  });
}

// ---- Firestore sync ----
export async function loadProfilesFromCloud(): Promise<ProfilesState | null> {
  try {
    const user = await ensureAnonymousAuth();
    if (!user) return null;
    const snap = await getDoc(doc(db, "users", user.uid));
    if (!snap.exists()) return null;
    const data = snap.data();
    if (!Array.isArray(data.children)) return null;
    return {
      children: data.children as ChildProfile[],
      activeChildId: (data.activeChildId as string) || undefined,
    };
  } catch {
    return null;
  }
}

// Save everywhere: cache immediately (offline-safe), apply to prefs, then cloud.
export async function saveProfiles(state: ProfilesState): Promise<void> {
  writeCache(state);
  applyActiveChildToPrefs(state);
  try {
    const user = await ensureAnonymousAuth();
    if (!user) return;
    // JSON round-trip strips any `undefined` (Firestore rejects those).
    const clean = JSON.parse(JSON.stringify(state.children));
    await setDoc(
      doc(db, "users", user.uid),
      {
        children: clean,
        activeChildId: state.activeChildId ?? null,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  } catch {
    // Offline or no auth — cache already holds the latest state.
  }
}
