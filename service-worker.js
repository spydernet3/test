self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('pwa-cache').then(cache => {
      return cache.addAll(['./', './index.html']);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request))
  );
});
if ('Notification' in window && Notification.permission === 'granted') {
  navigator.serviceWorker.getRegistration().then(reg => {
    reg.showNotification('Action Required!', { // Changed the title to be more engaging
      body: 'Tap one of the four options below to proceed.', // NEW: Descriptive body text
      icon: '/assets/icon.png',
      badge: '/assets/icon.png',
      data: { url: '/' },
      // NEW: Actions array for the buttons
      actions: [
        {
          action: 'view_details',
          title: 'View Details',
          icon: '/assets/icon-view.png' // Optional: Icon for the button
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
    });
  });
}
