import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './i18n';
import App from './App.tsx';

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
