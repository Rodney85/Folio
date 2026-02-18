
import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { useEffect } from 'react';

export function PostHogProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        const apiKey = import.meta.env.VITE_POSTHOG_KEY;
        const apiHost = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com';

        if (apiKey) {
            posthog.init(apiKey, {
                api_host: apiHost,
                person_profiles: 'always', // or 'identified_only'
                capture_pageview: false // We prefer manual control or via PageTracker
            });
        }
    }, []);

    return <PHProvider client={posthog}>{children}</PHProvider>;
}
