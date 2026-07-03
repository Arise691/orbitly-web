'use strict';

/* Orbitly Service Worker
   Strategy:
   - App shell (HTML/CSS/JS/icons) → cache-first, so the site opens instantly
     and works offline after the first visit.
   - Navigations (page loads) → network-first, falling back to cache, then
     to offline.html if nothing is available.
   Bump CACHE_VERSION whenever you change style.css / script.js / HTML so
   returning visitors get the new files instead of a stale cache. */

const CACHE_VERSION = 'orbitly-v1.0.1';
const APP_SHELL = [
  './',
  'index.html',
  'auth.html',
  'dashboard.html',
  '404.html',
  'offline.html',
  'style.css',
  'script.js',
  'manifest.json',
  'assets/icons/icon-192.png',
  'assets/icons/icon-512.png',
  'assets/icons/apple-touch-icon.png',
  'favicon.ico'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin && !url.hostname.includes('fonts.g')) {
    return; // let cross-origin, non-font requests pass through untouched
  }

  // Navigations: network-first so users always get fresh content when online.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match('offline.html'))
        )
    );
    return;
  }

  // Static assets: cache-first, then network, updating the cache as we go.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => cached);
    })
  );
});
