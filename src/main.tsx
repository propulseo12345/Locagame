import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import * as Sentry from '@sentry/react';
import App from './App.tsx';
import './index.css';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  enabled: import.meta.env.PROD,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: false,
    }),
  ],
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.0,
  replaysOnErrorSampleRate: 1.0,
  beforeSend(event) {
    // Strip sensitive data from breadcrumbs and request bodies
    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs.map((bc) => {
        if (bc.data) {
          const keys = Object.keys(bc.data);
          for (const key of keys) {
            if (/password|token|secret|authorization|anon.key/i.test(key)) {
              bc.data[key] = '[FILTERED]';
            }
          }
        }
        return bc;
      });
    }
    if (event.request?.data) {
      const data = typeof event.request.data === 'string'
        ? event.request.data
        : JSON.stringify(event.request.data);
      if (/password|token|secret/i.test(data)) {
        event.request.data = '[FILTERED]';
      }
    }
    return event;
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
