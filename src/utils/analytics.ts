/**
 * Analytics Utility
 *
 * Simple client-side analytics tracking using Convex backend
 */

interface CarAddedEvent {
  brand: string;
  model: string;
  year: number;
  hasImages: boolean;
  hasProductLinks: boolean;
}

/**
 * Track when a car is added to the garage
 */
export const trackCarAdded = (data: CarAddedEvent) => {
  // Log analytics event to console for debugging
  console.log('[Analytics] Car Added:', data);

  // The actual analytics tracking is handled server-side through Convex mutations
  // This is just a client-side helper for logging
};

/**
 * Track user sign up
 */
export const trackSignUp = () => {
  console.log('[Analytics] User Sign Up');
  // Analytics tracking is handled through Convex on the backend
};

/**
 * Generic event tracker
 */
export const trackEvent = (eventName: string, data?: Record<string, any>) => {
  console.log(`[Analytics] ${eventName}:`, data);
  // Additional analytics platforms can be integrated here (e.g., Google Analytics, Mixpanel)
};
