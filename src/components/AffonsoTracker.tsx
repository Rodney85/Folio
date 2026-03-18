import { useEffect } from 'react';

/**
 * AffonsoTracker Component
 * 
 * This component dynamically injects the Affonso tracking script into the document head.
 * Following the recommended approach for React applications:
 * https://affonso.io/help/installation-guides/frameworks/react-integration
 */
const AffonsoTracker = () => {
    useEffect(() => {
        // Prevent duplicate script injection
        if (document.querySelector('script[src="https://cdn.affonso.io/js/pixel.min.js"]')) {
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
                document.head.removeChild(script);
            }
        };
    }, []);

    return null;
};

export default AffonsoTracker;
