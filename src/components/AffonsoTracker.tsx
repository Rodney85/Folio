import { useEffect } from 'react';

/**
 * AffonsoTracker Component
 * 
 * This component dynamically injects the Affonso tracking script into the document head.
 * Following the recommended approach for React-specific integration:
 * https://affonso.io/help/installation-guides/frameworks/react-integration
 */
const AffonsoTracker = () => {
    useEffect(() => {
        // Prevent duplicate script injection if already added via index.html or previous mount
        if (document.querySelector('script[src="https://cdn.affonso.io/js/pixel.min.js"]')) {
            console.log('Affonso script already present, skipping dynamic injection');
            return;
        }

        const script = document.createElement('script');
        script.async = true;
        script.defer = true;
        script.setAttribute('data-affonso', 'cmmdbhklv0013jki1yfygr1mr');
        script.setAttribute('data-cookie_duration', '30');
        script.src = 'https://cdn.affonso.io/js/pixel.min.js';
        
        document.head.appendChild(script);

        return () => {
            // Cleanup on unmount
            if (document.head.contains(script)) {
                // Not strictly removing for trackers as we want them to stay for the session,
                // but following the guide's recommendation for proper lifecycle management.
                document.head.removeChild(script);
            }
        };
    }, []);

    return null;
};

export default AffonsoTracker;
