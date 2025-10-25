
// A list of all cache names
const CACHE_NAME = 'pwa-cache-v1';
const ASSETS_TO_CACHE = [
  './', 
  './index.html',
  // Add other critical assets (CSS, JS, manifest, icons, etc.) here
  '/assets/icon.png', 
  '/assets/icon-view.png',
  '/assets/icon-done.png',
  '/assets/icon-snooze.png',
  '/assets/icon-dismiss.png'
];

// ----------------------------------------------------------------------
// 1. INSTALL Event: Caching Assets
// ----------------------------------------------------------------------
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[Service Worker] Caching app shell');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// ----------------------------------------------------------------------
// 2. ACTIVATE Event: Clean Up Old Caches (Important for PWA updates)
// ----------------------------------------------------------------------
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating & cleaning up old caches...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// ----------------------------------------------------------------------
// 3. FETCH Event: Serve Cached Assets or Fetch from Network
// ----------------------------------------------------------------------
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(resp => {
        // Return cached response if found, otherwise fetch from network
        return resp || fetch(event.request);
    })
  );
});

// ----------------------------------------------------------------------
// 4. PUSH Event: Receive and Show Persistent Notification
// ----------------------------------------------------------------------
self.addEventListener('push', event => {
  console.log('[Service Worker] Push received.');

  // This is the desired body and action button structure
  const title = 'Action Required: New Notification!';
  const options = {
      body: 'Tap one of the four options below to proceed.',
      icon: '/assets/icon.png',
      badge: '/assets/icon.png', // Shown in the status bar on some platforms
      data: { url: '/reminder-details' }, // Data to use when the notification is clicked
      actions: [
          {
              action: 'view_details',
              title: 'View Details',
              icon: '/assets/icon-view.png' 
          },
          {
              action: 'mark_as_done',
              title: 'Mark Done',
              icon: '/assets/icon-done.png'
          },
          {
              action: 'snooze',
              title: 'Snooze (1h)',
              icon: '/assets/icon-snooze.png'
          },
          {
              action: 'dismiss',
              title: 'Dismiss',
              icon: '/assets/icon-dismiss.png'
          }
      ]
  };

  // Show the notification. event.waitUntil keeps the service worker alive.
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// ----------------------------------------------------------------------
// 5. NOTIFICATIONCLICK Event: Handle Button Presses
// ----------------------------------------------------------------------
self.addEventListener('notificationclick', event => {
  const clickedNotification = event.notification;
  const action = event.action; // The 'action' string from the clicked button
  const urlToOpen = clickedNotification.data.url || '/'; // Default to homepage

  console.log(`[Service Worker] Notification Action: ${action}`);
  clickedNotification.close(); // Close the notification once clicked

  // Handle the custom actions
  if (action === 'dismiss') {
    // Dismiss button clicked. Do nothing or log a metric.
    console.log('Notification dismissed by user.');
    return;
  } 
  
  // Handle other actions (View Details, Mark Done, Snooze)
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      // If the app is already open, focus the window and navigate
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          if (action === 'view_details') {
             return client.navigate(urlToOpen).then(client => client.focus());
          }
          // For 'mark_as_done' and 'snooze', we might just focus the app without navigating
          return client.focus();
        }
      }

      // If the app is not open, open a new window to the appropriate URL
      if (action === 'view_details') {
          return clients.openWindow(urlToOpen);
      }
      
      // For 'mark_as_done' and 'snooze' in background, you'd execute background logic here:
      if (action === 'mark_as_done') {
          // e.g., fetch('/api/mark-task-done', { method: 'POST' });
          console.log('Background task: Marking item as done.');
      } else if (action === 'snooze') {
          // e.g., fetch('/api/snooze-reminder', { method: 'POST' });
          console.log('Background task: Snoozing reminder.');
      }
    })
  );
});
