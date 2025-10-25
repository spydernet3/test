// A list of all cache names
const CACHE_NAME = 'pwa-cache-v1';
const ASSETS_TO_CACHE = [
  './', 
  './index.html',
  // Ensure all necessary icons for the buttons are listed here!
  '/assets/icon.png', 
  '/assets/icon-view.png', 
  '/assets/icon-done.png',
  '/assets/icon-snooze.png',
  '/assets/icon-dismiss.png'
];

// ----------------------------------------------------------------------
// 1. INSTALL Event: Caching Assets (Your existing logic)
// ----------------------------------------------------------------------
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[Service Worker] Caching app shell');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// ----------------------------------------------------------------------
// 2. FETCH Event: Serve Cached Assets or Fetch (Your existing logic)
// ----------------------------------------------------------------------
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request))
  );
});

// ----------------------------------------------------------------------
// 3. ACTIVATE Event: Clean Up Old Caches (Best Practice)
// ----------------------------------------------------------------------
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => cacheName !== CACHE_NAME)
                  .map(cacheName => caches.delete(cacheName))
      );
    })
  );
});


// ----------------------------------------------------------------------
// 4. PUSH Event: Receive and Show Persistent Notification
// ----------------------------------------------------------------------
self.addEventListener('push', event => {
  console.log('[Service Worker] Push received. Showing persistent notification.');

  const title = 'A Quick Action Is Required!';
  const options = {
      // THIS IS THE NEW BODY CONCEPT YOU WANTED
      body: 'Tap one of the four options below to proceed.',
      icon: '/assets/icon.png',
      badge: '/assets/icon.png',
      data: { url: '/reminder-details' }, // Data to open a specific page on click
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

  // This ensures the notification is shown even when the app is closed.
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// ----------------------------------------------------------------------
// 5. NOTIFICATIONCLICK Event: Handle Button Presses
// ----------------------------------------------------------------------
self.addEventListener('notificationclick', event => {
  const action = event.action; 
  const urlToOpen = event.notification.data.url || '/';

  event.notification.close(); // Close the notification

  // Handle specific button clicks
  if (action === 'dismiss') {
    return; // Dismissed, nothing more to do
  } 
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      // If the app is open, focus it and/or navigate
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          if (action === 'view_details') {
             return client.navigate(urlToOpen).then(client => client.focus());
          }
          return client.focus(); // Focus for 'Mark Done'/'Snooze'
        }
      }

      // If the app is closed, open a new window
      if (action === 'view_details') {
          return clients.openWindow(urlToOpen);
      }
      
      // Execute background logic for the other buttons
      if (action === 'mark_as_done') {
          console.log('Background task: Marking item as done.');
      } else if (action === 'snooze') {
          console.log('Background task: Snoozing reminder.');
      }
    })
  );
});
