// Listen for notification click event
self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  // 1. Get the list of all open window clients controlled by this Service Worker
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(windowClients => {
      const urlToOpen = self.registration.scope; // The root URL of the PWA

      // 2. Check if the app is already open in a tab
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          // If the app is open, focus on that tab
          return client.focus();
        }
      }

      // 3. If the app is not open, open a new window/tab to the root URL
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
