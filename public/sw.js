const CACHE_NAME = "climaguard-v1";
const STATIC_ASSETS = [
  "/",
  "/dashboard",
  "/health",
  "/offline",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Don't cache API routes or POST requests
  if (request.method !== "GET" || request.url.includes("/api/")) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() =>
        caches.match(request).then((cached) => {
          if (cached) return cached;
          // Fallback for navigation requests
          if (request.mode === "navigate") {
            return caches.match("/offline") || new Response(
              `<!DOCTYPE html><html><head><title>ClimaGuard - Offline</title>
              <meta name="viewport" content="width=device-width,initial-scale=1">
              <style>body{font-family:sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f9fafb;text-align:center;padding:20px}
              h1{color:#16a34a;font-size:2rem;margin-bottom:8px}.icon{font-size:4rem;margin-bottom:16px}p{color:#6b7280;max-width:400px;line-height:1.6}
              .tip{background:#fef3c7;border:1px solid #fde68a;border-radius:12px;padding:16px;margin-top:24px;max-width:400px;text-align:left}
              .tip h3{color:#92400e;margin:0 0 8px 0;font-size:0.9rem}
              .tip ul{margin:0;padding-left:20px;color:#78350f;font-size:0.85rem;line-height:1.8}</style>
              </head><body>
              <div class="icon">🛡️</div>
              <h1>ClimaGuard</h1>
              <p>You are currently offline. Your last saved risk report is available in the app's local storage.</p>
              <p style="margin-top:8px;font-size:0.85rem;color:#9ca3af">Go back online to get updated climate risk analysis powered by Gemini AI.</p>
              <div class="tip">
                <h3>⚠️ Emergency Health Tips (Offline)</h3>
                <ul>
                  <li>High fever after floods → ORS + keep cool, seek care if above 39°C</li>
                  <li>Heat exhaustion → shade, cool damp cloth on neck, small sips of water</li>
                  <li>Breathing issues → damp cloth over nose, stay indoors</li>
                  <li>Vomiting/diarrhea → ORS immediately, avoid solid food 2 hrs</li>
                  <li>Heatstroke (unconscious + hot) → emergency services NOW</li>
                </ul>
              </div>
              </body></html>`,
              { headers: { "Content-Type": "text/html" } }
            );
          }
          return new Response("Offline", { status: 503 });
        })
      )
  );
});
