const CACHE_NAME = 'vb-player-v1';

// Files that form the app shell — cached on install
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Install: cache the app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch: serve app shell from cache; always go network for Google APIs
self.addEventListener('fetch', event => {
  const url = event.request.url;

  // Never cache Google API / auth calls — always fetch live
  if (
    url.includes('googleapis.com') ||
    url.includes('accounts.google.com') ||
    url.includes('apis.google.com')
  ) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Cache-first for everything else (app shell)
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
