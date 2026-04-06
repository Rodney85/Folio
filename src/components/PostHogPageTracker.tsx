import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { usePostHog } from '@posthog/react';

/**
 * Tracks page views on every route change.
 * Must be rendered inside <BrowserRouter> so it can access useLocation().
 */
export function PostHogPageTracker() {
    const location = useLocation();
    const posthog = usePostHog();

    useEffect(() => {
        if (posthog) {
            posthog.capture('$pageview', {
                $current_url: window.location.href,
            });
        }
    }, [location.pathname, location.search, posthog]);

    return null;
}
