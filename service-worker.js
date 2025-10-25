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

// --- Inside your service-worker.js file ---

// 1. Listen for the 'push' event sent from your server
self.addEventListener('push', (event) => {
    // If your server sends a payload, you can use event.data.json()
    // For this example, we will define the notification options directly here
    const title = 'Your Reminder Is Due!';
    
    // This is the body concept change you requested
    const notificationOptions = {
        body: 'Tap one of the four options below to proceed.',
        icon: '/assets/icon.png',
        badge: '/assets/icon.png',
        data: { url: '/reminder-page-id' }, // Custom data to open a specific page
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

    // The event.waitUntil ensures the Service Worker stays alive until 
    // the notification is displayed.
    event.waitUntil(
        self.registration.showNotification(title, notificationOptions)
    );
});

// 2. Ensure your action handling is still in place (from the previous step)
self.addEventListener('notificationclick', (event) => {
  const clickedNotification = event.notification;
  const action = event.action; 
  
  // ... (existing action handling code goes here)
});


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
