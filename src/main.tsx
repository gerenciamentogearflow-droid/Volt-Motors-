import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register PWA Service Worker
const isProd = !!(import.meta as any).env?.PROD;
if ('serviceWorker' in navigator && isProd) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => {
        console.log('Volt Motors Service Worker registrado de forma elegante:', reg.scope);
      })
      .catch((err) => {
        console.error('Falha ao registrar Service Worker:', err);
      });
  });
} else if ('serviceWorker' in navigator) {
  // In development, also register so it's testable if preview runs over HTTPS
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => {
        console.log('Volt Motors Service Worker registrado (DEV):', reg.scope);
      })
      .catch((err) => {
        console.error('Falha ao registrar Service Worker (DEV):', err);
      });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
