import ReactGA from 'react-ga4';

// Initialize Google Analytics with your Measurement ID
export const initGA = () => {
  const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
  
  // Only initialize in production to avoid tracking development activity
  if (import.meta.env.PROD && GA_MEASUREMENT_ID) {
    ReactGA.initialize(GA_MEASUREMENT_ID);
    console.log('Google Analytics initialized');
  } else {
    console.log('Google Analytics not initialized in development mode');
  }
};

// Track page views
export const trackPageView = (path: string) => {
  if (import.meta.env.PROD) {
    ReactGA.send({ hitType: 'pageview', page: path });
    console.log(`Page view tracked: ${path}`);
  }
};

// Track events (e.g., sign-ups, button clicks, etc.)
export const trackEvent = (category: string, action: string, label?: string, value?: number) => {
  if (import.meta.env.PROD) {
    ReactGA.event({
      category,
      action,
      label,
      value,
    });
    console.log(`Event tracked: ${category} - ${action} ${label ? `- ${label}` : ''}`);
  }
};

// Track user sign-up
export const trackSignUp = (method: string) => {
  trackEvent('User', 'Sign Up', method);
};

// Track subscription upgrade
export const trackSubscriptionUpgrade = (plan: string) => {
  trackEvent('Subscription', 'Upgrade', plan);
};

// Track car added
export const trackCarAdded = (carData: {
  brand: string;
  model: string;
  year: number;
  hasImages: boolean;
  hasProductLinks: boolean;
}) => {
  trackEvent('Content', 'Car Added', `${carData.brand} ${carData.model}`);
};

// Track part added
export const trackPartAdded = () => {
  trackEvent('Content', 'Part Added');
};

// Track profile completion
export const trackProfileCompleted = () => {
  trackEvent('User', 'Profile Completed');
};
