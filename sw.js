// Listen for notification click event
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('https://spydernet3.github.io/Nothing-Reminder/')
  );
});
