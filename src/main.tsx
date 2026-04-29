import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './i18n';
import App from './App.tsx';

// Global storage for the install prompt event.
let deferredPrompt: any = null;

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt = e;
    console.log('✨ PWA Install prompt captured globally');
    
    // Dispatch a custom event to notify hooks/components
    window.dispatchEvent(new CustomEvent('pwa-prompt-available', { detail: e }));
  });

  // Export a way to access it
  (window as any).getPwaDeferredPrompt = () => deferredPrompt;
  (window as any).clearPwaDeferredPrompt = () => { deferredPrompt = null; };
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Keep installability restricted to /admin routes.
    // Remove any non-admin SW registrations that may exist from older deployments.
    if (!window.location.pathname.startsWith('/admin')) {
      void navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          if (!registration.scope.includes('/admin')) {
            void registration.unregister();
          }
        });
      });
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
