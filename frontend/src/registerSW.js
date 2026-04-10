// Registers the service worker for PWA offline support
export const registerSW = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('SW registered:', reg.scope))
        .catch(err => console.log('SW registration failed:', err));
    });
  }
};