
import { PostHogProvider as PHProvider } from '@posthog/react';

const options = {
    api_host: '/ingest',             // All events go through our own domain
    ui_host: 'https://us.posthog.com', // PostHog toolbar & heatmaps still point to real dashboard
    person_profiles: 'always',
    capture_pageview: false,         // Manual control via PostHogPageTracker
} as const;

export function PostHogProvider({ children }: { children: React.ReactNode }) {
    return (
        <PHProvider
            apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_PROJECT_TOKEN}
            options={options}
        >
            {children}
        </PHProvider>
    );
}
