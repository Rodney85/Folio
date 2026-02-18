
import { useLocation } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { NavBar } from '@/components/ui/navbar-from-md';

export const FloatingNavBar = () => {
    const location = useLocation();
    const { isSignedIn } = useUser();

    // Hide navbar for logged-in users — they have their own sidebar nav
    if (isSignedIn) return null;

    // Define routes where the floating navbar should appear
    // The Landing Page (/) and public info pages
    const publicRoutes = ['/', '/about', '/terms', '/privacy'];

    // Check if current path matches one of the public routes
    const shouldShow = publicRoutes.includes(location.pathname);

    if (!shouldShow) return null;

    return <NavBar />;
};
