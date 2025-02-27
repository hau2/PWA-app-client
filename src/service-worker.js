/* eslint-disable no-restricted-globals, no-undef */
// Disable ESLint rule for global variable restrictions (since service workers run in a different scope)

import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate } from 'workbox-strategies';
import { CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

// 🔹 Precache and serve static assets (HTML, CSS, JS, etc.)
// Workbox will cache all files listed in __WB_MANIFEST at build time
precacheAndRoute(self.__WB_MANIFEST || []);

// 🔹 Cache static resources (JS, CSS, Web Workers)
// - Uses StaleWhileRevalidate strategy: Serves from cache first, then updates cache with fresh data
registerRoute(
  ({ request }) => 
    request.destination === 'script' || 
    request.destination === 'style' || 
    request.destination === 'worker',
  new StaleWhileRevalidate({
    cacheName: 'static-resources', // Name of the cache storage
  })
);

// 🔹 Cache images
// - Uses CacheFirst strategy: Serves from cache if available, otherwise fetches from the network
// - Applies expiration settings to remove old images from the cache
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images-cache', // Name of the cache storage for images
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50, // Limits the number of images stored
        maxAgeSeconds: 30 * 24 * 60 * 60, // Cache images for 30 days
      }),
    ],
  })
);

// 🔹 Cache API responses (for JSON and other data requests)
// - Uses StaleWhileRevalidate strategy: Serves cached API responses immediately but fetches fresh data in the background
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/posts'),
  new StaleWhileRevalidate({
    cacheName: 'api-cache', // Name of the cache storage for API responses
  })
);

// 🔹 Install event (Triggers when the Service Worker is installed)
// - Calls `skipWaiting()` to activate the new Service Worker immediately
self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
  self.skipWaiting();
});

// 🔹 Activate event (Triggers when the Service Worker is activated)
// - Calls `clients.claim()` to immediately take control of all open clients/pages
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.');
  self.clients.claim();
});

self.addEventListener('push', (event) => {
  console.log('📩 Push event received:', event);

  if (event.data) {
    const data = event.data.json();
    console.log('🔔 Notification Data:', data);

    const options = {
      body: data.message,
      icon: '/android-chrome-192x192.png', // Change to your app's icon
      badge: '/android-chrome-192x192.png',
      vibrate: [200, 100, 200], // Vibration pattern
      data: { url: data.url || '/' }, // Handle notification click
      actions: [
        { action: 'open', title: 'Open App' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle click event on notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(clients.openWindow(event.notification.data.url));
  } else {
    console.log('🔕 Notification dismissed.');
  }
});