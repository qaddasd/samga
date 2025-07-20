importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');

// Custom notification handling for grades
self.addEventListener('push', function(event) {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    
    // Check if this is a grade notification
    if (data && data.custom && data.custom.type === 'grade') {
      const gradeInfo = data.custom;
      
      // Create custom notification for grades
      self.registration.showNotification(gradeInfo.title || 'Новая оценка', {
        body: `${gradeInfo.subject}: ${gradeInfo.grade}`,
        icon: '/favicon-32x32.png',
        badge: '/favicon-16x16.png',
        data: gradeInfo,
        vibrate: [200, 100, 200],
        actions: [
          {
            action: 'view',
            title: 'Посмотреть'
          }
        ]
      });
      
      // Prevent default OneSignal notification for this event
      event.stopImmediatePropagation();
      event.waitUntil(Promise.resolve());
    }
  } catch (err) {
    console.error('Error processing push notification:', err);
  }
}, true);  // Use capture to intercept before OneSignal

// Handle notification click
self.addEventListener('notificationclick', function(event) {
  // Close the notification
  event.notification.close();
  
  // Handle custom actions
  if (event.action === 'view' && event.notification.data) {
    const data = event.notification.data;
    
    // Open the specific grade page when clicked
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then(clientList => {
        // Try to focus an existing window
        for (const client of clientList) {
          if ('focus' in client) {
            return client.focus().then(client => {
              if (data.url) {
                return client.navigate(data.url);
              }
              return client.navigate('/grades');
            });
          }
        }
        
        // Open a new window if no existing windows
        if (self.clients.openWindow) {
          return self.clients.openWindow(data.url || '/grades');
        }
      })
    );
  }
}, true);