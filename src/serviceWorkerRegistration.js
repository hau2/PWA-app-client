const isLocalhost = Boolean(
    window.location.hostname === 'localhost' ||
    window.location.hostname === '[::1]' ||
    window.location.hostname.match(
      /^127(?:\.(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[0-9])){3}$/
    )
  );
  
  export function register() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;
  
        if (isLocalhost) {
          // Chạy trên localhost: kiểm tra xem SW có tồn tại không
          checkValidServiceWorker(swUrl);
          navigator.serviceWorker.ready.then(() => {
            console.log('This PWA is running in development mode on localhost.');
          });
        } else {
          // Chạy trên môi trường production
          registerValidSW(swUrl);
        }
      });
    }
  }
  
  function registerValidSW(swUrl) {
    navigator.serviceWorker
      .register(swUrl)
      .then((registration) => {
        console.log('Service Worker registered with scope:', registration.scope);
  
        // Lắng nghe sự kiện update của service worker
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  console.log('New content is available and will be used.');
                  window.location.reload(); // Tự động refresh khi có bản mới
                } else {
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
  
  function checkValidServiceWorker(swUrl) {
    fetch(swUrl, { headers: { 'Service-Worker': 'script' } })
      .then((response) => {
        if (
          response.status === 404 ||
          response.headers.get('content-type')?.indexOf('javascript') === -1
        ) {
          console.warn('No service worker found. Removing...');
          navigator.serviceWorker.ready.then((registration) => {
            registration.unregister().then(() => {
              window.location.reload();
            });
          });
        } else {
          registerValidSW(swUrl);
        }
      })
      .catch(() => {
        console.log('No internet connection found. Running in offline mode.');
      });
  }
  
  export function unregister() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready
        .then((registration) => {
          registration.unregister();
        })
        .catch((error) => {
          console.error('Error while unregistering service worker:', error);
        });
    }
  }
  