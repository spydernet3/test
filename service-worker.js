// Existing Caching Logic
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('pwa-cache').then(cache => {
      // Ensure these paths are correct
      return cache.addAll(['./', './index.html']);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request))
  );
});

// ------------------------------------------------------------------
// REQUIRED LOGIC FOR MOBILE BACKGROUND NOTIFICATIONS
// ------------------------------------------------------------------

// 1. Listen for the 'push' event
// This event is triggered when your server sends a push message.
self.addEventListener('push', (event) => {
    // Attempt to parse the data sent from your server
    const data = event.data ? event.data.json() : {
        title: 'New Reminder',
        body: 'You have a notification!',
        url: '/'
    };
    
    const title = data.title;
    const options = {
        body: data.body,
        icon: '/assets/icon.png', // CRITICAL: Use your actual icon path
        badge: '/assets/icon.png',
        data: {
            url: data.url // Store the URL to navigate to when the user clicks
        }
    };

    // Keep the service worker alive until the notification is displayed
    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// 2. Listen for the 'notificationclick' event
// This event handles what happens when the user taps the displayed notification.
self.addEventListener('notificationclick', (event) => {
    event.notification.close(); // Close the notification immediately

    const urlToOpen = event.notification.data.url || '/';

    event.waitUntil(
        // Look through all open windows/tabs to see if the PWA is running
        clients.matchAll({ type: 'window' }).then((clientList) => {
            for (const client of clientList) {
                // If the app is open, focus the existing tab
                if (client.url.includes(urlToOpen) && 'focus' in client) {
                    return client.focus();
                }
            }
            // If the app is closed, open a new window/tab
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
