import { createRoot } from 'react-dom/client'
import { ClerkProvider, useAuth } from '@clerk/clerk-react'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { convex } from './lib/convex'
import App from './App.tsx'
import './index.css'
import * as Sentry from "@sentry/react";
import { PostHogProvider } from './components/PostHogProvider';

// Get the Clerk publishable key from environment variables
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key. Add VITE_CLERK_PUBLISHABLE_KEY to your .env file");
}

// Initialize Sentry
const SENTRY_DSN = "https://3b8d91e527ee8b19742f6baaef8419ee@o4510742078947328.ingest.us.sentry.io/4510904653316097";

Sentry.init({
  dsn: SENTRY_DSN,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
  // Set `tracePropagationTargets` to control for which URLs distributed tracing should be enabled
  // We include localhost during dev, and the Convex API URL in all environments
  tracePropagationTargets: ["localhost", new RegExp(import.meta.env.VITE_CONVEX_URL)],
  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

createRoot(document.getElementById("root")!).render(
  <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
    <ConvexProviderWithClerk useAuth={useAuth} client={convex}>
      <PostHogProvider>
        <App />
      </PostHogProvider>
    </ConvexProviderWithClerk>
  </ClerkProvider>
);
