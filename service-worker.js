self.addEventListener('install', event => {
    // ... existing install logic ...
});

self.addEventListener('fetch', event => {
    // ... existing fetch logic ...
});

// NEW: Handles clicks on system notifications, which is crucial for PWA/mobile behavior.
self.addEventListener('notificationclick', event => {
    // 1. Close the notification right away
    event.notification.close();

    // 2. Focus on the existing app window or open a new one
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(windowClients => {
            // Check if the app is already open and focus it
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url.includes('index.html') && 'focus' in client) {
                    return client.focus();
                }
            }
            // If the app is not open, open a new window
            if (clients.openWindow) {
                return clients.openWindow('./index.html');
            }
        })
    );
});
