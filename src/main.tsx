import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Register the public SW only for non-admin routes.
    // The admin SW (/admin-sw.js scoped to /admin/) is registered
    // dynamically by useAdminPwa when the user enters an /admin/ route.
    if (!window.location.pathname.startsWith('/admin')) {
      void navigator.serviceWorker.register('/sw.js');
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
