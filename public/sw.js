const CACHE = "pdftools-v3";
const OFFLINE_PAGE = "/offline";

// Pre-caching every tool route made a first visit download dozens of full pages
// and delayed the tool the visitor actually opened. Keep only the navigation
// fallback in the install transaction; visited pages/assets are cached at run
// time instead.
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.add(OFFLINE_PAGE)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok) {
          const cache = await caches.open(CACHE);
          await cache.put(request, response.clone());
        }
        return response;
      } catch {
        return (await caches.match(request)) ||
          (await caches.match(OFFLINE_PAGE)) ||
          Response.error();
      }
    })());
    return;
  }

  // Cache immutable Next.js build assets and the PDF.js worker only after they
  // are genuinely requested. Do not intercept APIs or return HTML for a failed
  // script/font request.
  const isRuntimeAsset = url.pathname.startsWith("/_next/static/") ||
    url.pathname === "/pdf.worker.min.mjs" ||
    ["script", "style", "font", "worker"].includes(request.destination);
  if (!isRuntimeAsset) return;

  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE);
      await cache.put(request, response.clone());
    }
    return response;
  })());
});
