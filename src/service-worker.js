self.addEventListener('push', function(event) {
  const data = event.data.json();
  const title = data.title || 'Notification';
  const options = {
    body: data.body || 'You have a new notification!',
    icon: data.icon || '/assets/icons/icon-96x96.png'  // Icône de notification
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});
