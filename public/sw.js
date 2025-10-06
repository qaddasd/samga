// Service Worker for cross-platform notifications in Samga.nis

// Cache name for offline access
const CACHE_NAME = 'samga-cache-v1';

// Files to cache for offline access
const urlsToCache = [
  '/',
  '/index.html',
  '/sounds/notification.mp3',
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName !== CACHE_NAME;
        }).map(cacheName => {
          return caches.delete(cacheName);
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache if available
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

// Push notification event
self.addEventListener('push', event => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = {
        title: 'Новое уведомление',
        body: event.data.text(),
      };
    }
  }

  const title = data.title || 'Samga.nis';
  const body = data.body || 'Новое уведомление из электронного дневника';
  const icon = data.icon || '/apple-touch-icon.png';
  const badge = '/favicon-32x32.png';
  const tag = data.tag || 'samga-notification';
  const url = data.url || '/grades';
  
  const options = {
    body,
    icon,
    badge,
    tag,
    data: { url },
    vibrate: [100, 50, 100],
    renotify: true,
    requireInteraction: true,
  };
  
  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click event - open the app at the right page
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window' })
      .then(clientList => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.focus();
            client.navigate(urlToOpen);
            return;
          }
        }
        // Open new window
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      })
  );
});

// Custom function to format notification messages for grades
function formatGradeNotification(subject, grade) {
  return {
    title: `Новая оценка по предмету: ${subject}`,
    body: `Поставлена оценка: ${grade}`,
    url: '/grades'
  };
} 