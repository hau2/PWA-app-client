// 🔹 Check if the application is running on localhost
// - This ensures the Service Worker behaves differently in development vs. production.
const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||  // Running on localhost
  window.location.hostname === '[::1]' ||  // IPv6 localhost
  window.location.hostname.match(  // IPv4 localhost (127.0.0.1)
    /^127(?:\.(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[0-9])){3}$/
  )
);

// 🔹 Function to register the Service Worker
// - This function is called when the page loads.
export function register() {
  if ('serviceWorker' in navigator) {  // Check if Service Worker is supported in the browser
    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`; // Define the path of the Service Worker

      if (isLocalhost) {
        // If running in localhost, check if the Service Worker is valid
        checkValidServiceWorker(swUrl);
        navigator.serviceWorker.ready.then(() => {
          console.log('This PWA is running in development mode on localhost.');
        });
      } else {
        // If running in production, register the Service Worker normally
        registerValidSW(swUrl);
      }
    });
  }
}

// 🔹 Function to register a valid Service Worker
function registerValidSW(swUrl) {
  navigator.serviceWorker
    .register(swUrl)  // Register the Service Worker
    .then((registration) => {
      console.log('Service Worker registered with scope:', registration.scope);

      // Listen for updates in the Service Worker
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker) {
          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // If a new version of the Service Worker is available, reload the page
                console.log('New content is available and will be used.');
                window.location.reload();
              } else {
                // If no prior Service Worker exists, cache content for offline use
                console.log('Content is cached for offline use.');
              }
            }
          };
        }
      };
    })
    .catch((error) => {
      console.error('Error during service worker registration:', error);
    });
}

// 🔹 Function to check if the Service Worker is valid (for localhost debugging)
function checkValidServiceWorker(swUrl) {
  fetch(swUrl, { headers: { 'Service-Worker': 'script' } })  // Try fetching the Service Worker file
    .then((response) => {
      if (
        response.status === 404 ||  // If the file is missing
        response.headers.get('content-type')?.indexOf('javascript') === -1  // If it's not a valid JavaScript file
      ) {
        console.warn('No service worker found. Removing...');
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();  // Reload the page after removing the invalid SW
          });
        });
      } else {
        // If the Service Worker is valid, register it
        registerValidSW(swUrl);
      }
    })
    .catch(() => {
      console.log('No internet connection found. Running in offline mode.');
    });
}

// 🔹 Function to unregister the Service Worker
export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister(); // Unregister the current Service Worker
      })
      .catch((error) => {
        console.error('Error while unregistering service worker:', error);
      });
  }
}
