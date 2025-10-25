// The name of your cache must be the same throughout your code.
const CACHE_NAME = 'pwa-cache-v1'; 
const ASSETS_TO_CACHE = [
  './', 
  './index.html',
  // Your manifest references icon.png. Add the button icons too!
  'assets/icon.png', 
  'assets/icon-view.png',
  'assets/icon-done.png',
  'assets/icon-snooze.png',
  'assets/icon-dismiss.png'
];

// ----------------------------------------------------------------------
// 1. INSTALL Event: Caching Assets (Your existing logic)
// ----------------------------------------------------------------------
self.addEventListener('install', event => {
  console.log('[SW] Installing and Caching...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// ----------------------------------------------------------------------
// 2. ACTIVATE Event: Clean Up Old Caches (Essential for updates)
// ----------------------------------------------------------------------
self.addEventListener('activate', event => {
  console.log('[SW] Activated. Cleaning up old caches.');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        // Delete all caches that don't match the current CACHE_NAME
        cacheNames.filter(name => name !== CACHE_NAME)
                  .map(name => caches.delete(name))
      );
    })
  );
});

// ----------------------------------------------------------------------
// 3. FETCH Event: Serve Cached Assets or Fetch (Your existing logic)
// ----------------------------------------------------------------------
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request))
  );
});

// ----------------------------------------------------------------------
// 4. PUSH Event: Receive and Show Persistent Notification
// ----------------------------------------------------------------------
self.addEventListener('push', event => {
  console.log('[SW] Push message received. Showing notification.');

  const title = 'Your Reminder Alert!';
  const options = {
      // ✅ This is the NEW BODY CONTENT you wanted
      body: 'Tap one of the four options below to proceed.',
      icon: 'assets/icon.png',
      badge: 'assets/icon.png',
      data: { url: '/reminder-page' }, // A specific page to open on main click
      actions: [
          { action: 'view_details', title: 'View Details', icon: 'assets/icon-view.png' },
          { action: 'mark_as_done', title: 'Mark Done', icon: 'assets/icon-done.png' },
          { action: 'snooze', title: 'Snooze (1h)', icon: 'assets/icon-snooze.png' },
          { action: 'dismiss', title: 'Dismiss', icon: 'assets/icon-dismiss.png' }
      ]
  };

  // self.registration.showNotification is what makes the notification persistent!
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// ----------------------------------------------------------------------
// 5. NOTIFICATIONCLICK Event: Handle Button Presses
// ----------------------------------------------------------------------
self.addEventListener('notificationclick', event => {
  const action = event.action; // The 'action' string from the clicked button
  const urlToOpen = event.notification.data.url || './'; 

  event.notification.close(); // Always close the notification on click

  // Skip logic if the user hit 'Dismiss'
  if (action === 'dismiss') {
    console.log('User dismissed the notification.');
    return;
  } 
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      // 1. Try to focus an existing window/tab
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          // If 'View Details' was clicked, navigate the existing window
          if (action === 'view_details') {
             return client.navigate(urlToOpen).then(client => client.focus());
          }
          // Otherwise, just focus the app (for Mark Done / Snooze)
          return client.focus();
        }
      }

      // 2. If no window is open, open a new one
      if (action === 'view_details') {
          return clients.openWindow(urlToOpen);
      }
      
      // 3. Handle background actions (Mark Done / Snooze) if the app is closed
      if (action === 'mark_as_done') {
          // You would typically send a request to your server here
          console.log('Executing background action: Mark Done');
      } else if (action === 'snooze') {
          // You would send a request to your server to reset the timer
          console.log('Executing background action: Snooze');
      }
    })
  );
});
