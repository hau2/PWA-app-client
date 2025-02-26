import axios from 'axios';

const API_BASE_URL = 'https://pwa-app-server.leconghau.id.vn'

// Function to check notification permission and subscribe if granted
export const askNotificationPermission = async () => {
  if (!('Notification' in window)) {
    alert('This browser does not support notifications.');
    return;
  }

  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    console.log('🔔 Notification permission granted.');
    await subscribeToPushNotifications();
  } else {
    console.warn('🚫 Notification permission denied.');
  }
};

// Function to subscribe user to push notifications
export const subscribeToPushNotifications = async () => {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Workers are not supported in this browser.');
    return;
  }

  try {
    // Register Service Worker
    const registration = await navigator.serviceWorker.ready;

    // Fetch VAPID public key from backend
    const { data } = await axios.get(`${API_BASE_URL}/api/notification/vapid-key`);
    const publicKey = data.publicKey;

    // Convert VAPID key
    const convertVapidKey = (base64String) => {
      const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
      const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');
      const rawData = window.atob(base64);
      return new Uint8Array([...rawData].map(char => char.charCodeAt(0)));
    };

    const applicationServerKey = convertVapidKey(publicKey);

    // Subscribe user
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });

    // Send subscription to backend
    await axios.post(`${API_BASE_URL}/api/notification/subscribe`, subscription);

    console.log('✅ Subscribed to push notifications!');
  } catch (error) {
    console.error('🚨 Failed to subscribe to push notifications:', error);
  }
};

// Function to send a push notification
export const sendPushNotification = async (title, message) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/notification/send`, { title, message });
    console.log('✅ Notification sent successfully:', response.data);
    alert('🔔 Notification sent!');
  } catch (error) {
    console.error('❌ Failed to send notification:', error.response?.data || error.message);
    alert('⚠️ Error sending notification. Check console for details.');
  }
};

// Function to unsubscribe from push notifications
export const unsubscribeFromPushNotifications = async () => {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      // Remove subscription from backend
      await axios.post(`${API_BASE_URL}/api/notification/remove-subscription`, {
        endpoint: subscription.endpoint,
      });

      // Unsubscribe from push manager
      await subscription.unsubscribe();
      console.log('🗑 Successfully unsubscribed from push notifications.');
    }
  } catch (error) {
    console.error('❌ Failed to unsubscribe:', error);
  }
};
