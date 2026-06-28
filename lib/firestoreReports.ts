import {
  collection, addDoc, getDocs, query, orderBy, limit,
  serverTimestamp, doc, setDoc, getDoc,
} from "firebase/firestore";
import { db, ensureAnonymousAuth } from "./firebase";

export type FirestoreReport = {
  id?: string;
  userId: string;
  country: string;
  flag: string;
  language: string;
  childAge: string;
  childName: string;
  overallRisk: string;
  analysis: string;
  weather: Record<string, unknown>;
  lat: number;
  lon: number;
  savedAt: string;
  createdAt?: unknown;
};

export type UserProfile = {
  childName: string;
  childAge: string;
  countryCode: string;
  fcmToken?: string;
  updatedAt?: unknown;
};

export async function saveReportToFirestore(report: Omit<FirestoreReport, "userId" | "createdAt">) {
  try {
    const user = await ensureAnonymousAuth();
    if (!user) return null;
    const ref = await addDoc(collection(db, "reports"), {
      ...report,
      userId: user.uid,
      createdAt: serverTimestamp(),
    });
    return ref.id;
  } catch (e) {
    console.error("Firestore save error:", e);
    return null;
  }
}

export async function getReportsFromFirestore(limitCount = 10): Promise<FirestoreReport[]> {
  try {
    const user = await ensureAnonymousAuth();
    if (!user) return [];
    const q = query(
      collection(db, "reports"),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as FirestoreReport));
  } catch (e) {
    console.error("Firestore fetch error:", e);
    return [];
  }
}

export async function saveUserProfile(profile: UserProfile) {
  try {
    const user = await ensureAnonymousAuth();
    if (!user) return;
    await setDoc(doc(db, "users", user.uid), {
      ...profile,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (e) {
    console.error("Firestore profile save error:", e);
  }
}

export async function getUserProfile(): Promise<UserProfile | null> {
  try {
    const user = await ensureAnonymousAuth();
    if (!user) return null;
    const snap = await getDoc(doc(db, "users", user.uid));
    return snap.exists() ? (snap.data() as UserProfile) : null;
  } catch {
    return null;
  }
}
