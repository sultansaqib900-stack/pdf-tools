const CACHE = "pdftools-v2";
const STATIC = [
  "/", "/compress", "/merge", "/split", "/unlock",
  "/rotate", "/resize", "/crop", "/delete-pages",
  "/organize", "/reverse-pdf", "/protect", "/image-to-pdf",
  "/pdf-to-images", "/text-to-pdf", "/html-to-pdf",
  "/extract-text", "/metadata", "/word-counter",
  "/insert-blank", "/add-page-numbers", "/watermark",
  "/fill-form", "/flatten-pdf", "/batch", "/annotate",
  "/sign", "/redact", "/pdf-to-excel",
  "/offline",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(STATIC))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request).catch(() =>
      caches.match(event.request).then((r) => r || caches.match("/offline"))
    )
  );
});
