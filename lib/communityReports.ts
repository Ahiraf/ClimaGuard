import {
  collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp,
} from "firebase/firestore";
import { db, ensureAnonymousAuth } from "./firebase";

// Crowdsourced, on-the-ground condition reports from parents — a network effect
// that makes the map more valuable as more people use it. See feature #6.

export const COMMUNITY_HAZARD_TYPES = [
  "Flooding",
  "Extreme Heat",
  "Storm / Cyclone",
  "Air Pollution / Smoke",
  "Water Contamination",
  "Disease Outbreak",
  "Other",
] as const;

export type CommunityReport = {
  id?: string;
  userId: string;
  countryCode: string;
  countryName: string;
  hazardType: string;
  note: string;
  lat: number;
  lon: number;
  createdAt?: unknown;
  savedAt: string;
};

export async function submitCommunityReport(
  report: Omit<CommunityReport, "userId" | "createdAt">
): Promise<string | null> {
  try {
    const user = await ensureAnonymousAuth();
    if (!user) return null;
    const ref = await addDoc(collection(db, "communityReports"), {
      ...report,
      note: report.note.slice(0, 280),
      userId: user.uid,
      createdAt: serverTimestamp(),
    });
    return ref.id;
  } catch (e) {
    console.error("Community report submit error:", e);
    return null;
  }
}

export async function getCommunityReports(limitCount = 20): Promise<CommunityReport[]> {
  try {
    await ensureAnonymousAuth();
    const q = query(
      collection(db, "communityReports"),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as CommunityReport));
  } catch (e) {
    console.error("Community reports fetch error:", e);
    return [];
  }
}
