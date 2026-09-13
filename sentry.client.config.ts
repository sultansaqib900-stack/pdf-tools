import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  // Error monitoring is useful; session replay is unnecessary for a document
  // tool and remains disabled to minimize browser data collection.
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
});
