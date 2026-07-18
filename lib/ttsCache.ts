// Persistent store for neural read-aloud audio. The browser's built-in offline
// voices mispronounce many languages (e.g. Bengali), so once we've fetched a
// clear neural clip from /api/tts we keep the audio Blob in IndexedDB. After one
// online visit to a page, its read-aloud then plays in the good voice even with
// no network — closing the gap in ClimaGuard's offline-first promise.
//
// IndexedDB (not localStorage) because audio is binary and can be a few hundred
// KB per clip; localStorage is text-only and tiny. Keyed by language + exact
// text so the same passage in the same language is stored once.

const DB_NAME = "climaguard-tts";
const STORE = "audio";
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof indexedDB === "undefined") return resolve(null);
    try {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

/** Stable cache key for a passage in a language. */
export function ttsKey(langCode: string, text: string): string {
  return `${langCode}::${text}`;
}

export async function getCachedAudio(key: string): Promise<Blob | null> {
  const db = await openDB();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(key);
      req.onsuccess = () => resolve((req.result as Blob) ?? null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function putCachedAudio(key: string, blob: Blob): Promise<void> {
  const db = await openDB();
  if (!db) return;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(blob, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

export async function hasCachedAudio(key: string): Promise<boolean> {
  return (await getCachedAudio(key)) != null;
}

/**
 * Fetch a passage's neural audio from /api/tts and store it for offline use.
 * No-op if already cached or offline. Returns true if the clip is available
 * (already cached or freshly stored). Used to warm the cache in the background.
 */
export async function prefetchAudio(langCode: string, text: string, language: string): Promise<boolean> {
  const key = ttsKey(langCode, text);
  if (await hasCachedAudio(key)) return true;
  if (typeof navigator !== "undefined" && navigator.onLine === false) return false;
  try {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, language }),
    });
    if (!res.ok) return false;
    const blob = await res.blob();
    if (!blob.size) return false;
    await putCachedAudio(key, blob);
    return true;
  } catch {
    return false;
  }
}
