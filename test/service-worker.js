const CACHE_NAME = "hrv-monitor-v1";

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
    .then(cache => {
      return cache.addAll([
        "/",
        "/index.html",
        "/dashboard.js",
        "/styles.css",
        "/manifest.json",
        "/icon.png"
      ]);
    })
  );
});


self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
    .then(response => {
      return response || fetch(event.request);
    })
  );
});