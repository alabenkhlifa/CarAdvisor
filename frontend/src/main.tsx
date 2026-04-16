import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'sonner';
import { initSentry } from './sentry';
import App from './App';
import './index.css';

initSentry();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
      <Toaster position="top-center" richColors closeButton />
    </HelmetProvider>
  </React.StrictMode>,
);
