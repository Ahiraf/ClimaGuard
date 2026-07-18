// ClimaGuard service worker — makes the app open with no network so a parent in
// a disaster zone can still reach the offline emergency guide, saved reports and
// helpline numbers. Two caches: a small app shell precached on install, and a
// runtime cache that keeps every page + JS chunk the user has loaded once.
//
// Strategy:
//  • Next.js build assets (/_next/static/*, images, fonts) → cache-first
//    (they are content-hashed and immutable, so this is safe and fast offline).
//  • Page navigations → network-first, falling back to the cached page, then to
//    the always-useful offline guide.
//  • API calls (incl. POST /api/tts) → never touched here; the app handles
//    offline behaviour itself (e.g. cached translations and read-aloud audio).

const SHELL_CACHE = "climaguard-shell-v2";
const RUNTIME_CACHE = "climaguard-runtime-v2";

// Routes worth having on the very first offline launch. Added individually so a
// single failure never aborts the whole precache (the old addAll bug).
const APP_SHELL = ["/", "/dashboard", "/health", "/offline-guide", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) =>
      Promise.allSettled(APP_SHELL.map((url) => cache.add(url)))
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== SHELL_CACHE && k !== RUNTIME_CACHE)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    /\.(?:js|css|woff2?|ttf|png|jpg|jpeg|svg|webp|ico|json)$/.test(url.pathname)
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin GETs. Let the app deal with API/POST itself.
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  // Immutable build assets: serve from cache first, fill the cache on miss.
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((res) => {
            if (res.ok) {
              const clone = res.clone();
              caches.open(RUNTIME_CACHE).then((c) => c.put(request, clone));
            }
            return res;
          })
      )
    );
    return;
  }

  // Page navigations: fresh when online, cached copy (or the offline guide) when not.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(RUNTIME_CACHE).then((c) => c.put(request, clone));
          }
          return res;
        })
        .catch(async () => {
          return (
            (await caches.match(request)) ||
            (await caches.match("/offline-guide")) ||
            (await caches.match("/")) ||
            new Response(
              "<!DOCTYPE html><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'>" +
                "<div style=\"font-family:sans-serif;text-align:center;padding:48px 20px\">" +
                "<div style='font-size:3rem'>🛡️</div><h1 style='color:#16a34a'>ClimaGuard</h1>" +
                "<p style='color:#6b7280'>You are offline. Open the app once with internet to save the emergency guide for offline use.</p></div>",
              { headers: { "Content-Type": "text/html" }, status: 200 }
            )
          );
        })
    );
    return;
  }

  // Everything else: network-first with a cache fallback.
  event.respondWith(
    fetch(request)
      .then((res) => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(RUNTIME_CACHE).then((c) => c.put(request, clone));
        }
        return res;
      })
      .catch(() => caches.match(request))
  );
});
