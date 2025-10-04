const CACHE_NAME = "expense-tracker-cache-v3";
const urlsToCache = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./src/styles.css",
  "./src/main.js",
  "./src/router.js",
  "./src/ui/navbar.js",
  "./src/ui/views/dashboard.js",
  "./src/ui/views/onboarding.js",
  "./src/ui/views/unlock.js",
  "./src/ui/views/quickAdd.js",
  "./src/ui/components/modal.js",
  "./src/lib/crypto.js",
  "./src/lib/db.js",
  "./src/lib/vault.js",
  "./src/lib/export.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
});
