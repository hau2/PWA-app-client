self.addEventListener('push', (event) => {
    console.log('📩 Push event received:', event);
  
    if (event.data) {
      const data = event.data.json();
      console.log('🔔 Notification Data:', data);
  
      const options = {
        body: data.message, 
        icon: '/logo192.png', // Change to your app's icon
        badge: '/logo192.png',
        vibrate: [200, 100, 200], // Vibration pattern
        data: { url: data.url || '/' }, // Handle notification click
        actions: [
          { action: 'open', title: 'Open App' },
          { action: 'dismiss', title: 'Dismiss' }
        ]
      };
  
      event.waitUntil(
        self.registration.showNotification(data.title, options)
      );
    }
  });
  
  // Handle click event on notification
  self.addEventListener('notificationclick', (event) => {
    event.notification.close();
  
    if (event.action === 'open') {
      event.waitUntil(clients.openWindow(event.notification.data.url));
    } else {
      console.log('🔕 Notification dismissed.');
    }
  });
  