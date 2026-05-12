// Ganti dengan nama repository GitHub Anda
var GHPATH = '/aplikasi-pembukuan-air';

// Versi cache - ubah angkanya setiap kali Anda update aplikasi
var VERSION = 'version_01';

var CACHE_NAME = 'pembukuan_air_' + VERSION;

// File-file yang ingin tersedia saat offline
var URLS = [
  `${GHPATH}/`,
  `${GHPATH}/index.html`,
  `${GHPATH}/script.js`,
  `${GHPATH}/manifest.json`
];

// Install service worker dan cache file
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      console.log('Caching files...');
      return cache.addAll(URLS);
    })
  );
});

// Serve file dari cache saat offline
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});

// Update cache saat ada versi baru
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
