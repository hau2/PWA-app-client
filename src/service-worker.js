/* eslint-disable no-restricted-globals */
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate } from 'workbox-strategies';
import { CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

// Caching các file build
precacheAndRoute(self.__WB_MANIFEST || []);

// Cache API requests (caching fetch requests)
registerRoute(
  ({ request }) => request.destination === 'script' || request.destination === 'style' || request.destination === 'worker',
  new StaleWhileRevalidate({
    cacheName: 'static-resources',
  })
);

// Cache hình ảnh
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50, // Tối đa 50 hình ảnh
        maxAgeSeconds: 30 * 24 * 60 * 60, // Cache trong 30 ngày
      }),
    ],
  })
);

// Cache API response (JSON, data)
registerRoute(
  ({ url }) => url.pathname.startsWith('/api'),
  new StaleWhileRevalidate({
    cacheName: 'api-cache',
  })
);

// Bắt sự kiện "install"
self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
  self.skipWaiting();
});

// Bắt sự kiện "activate"
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.');
  self.clients.claim();
});
