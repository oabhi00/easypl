const CACHE_NAME = 'cx3-flight-computer-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './css/cx3.css',
  './css/widgets.css',
  './css/themes/standard.css',
  './css/themes/night.css',
  './css/themes/daylight.css',
  './css/misc.css',
  './js/backend/calculator.js',
  './js/backend/formatHmsDms.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
