/**
 * Navigation utility functions for the Carfolio app
 * Centralizes all route definitions to prevent 404 errors
 */

// Define app routes as constants for consistent navigation
export const ROUTES = {
  // Public routes
  HOME: '/',
  WELCOME: '/welcome',
  SIGN_IN: '/sign-in',
  SIGN_UP: '/sign-up',
  PUBLIC_PROFILE: '/u/:username',
  PUBLIC_CAR: '/u/:username/car/:id',
  
  // Authenticated routes
  PROFILE: '/profile',
  PROFILE_EDIT: '/profile/edit',
  PROFILE_MENU: '/profile/menu',
  ADD_CAR: '/add-car',
  CARS: '/cars',
  CAR_DETAILS: '/car/:id',
  CAR_GALLERY: '/car/:id/gallery',
  EDIT_CAR: '/edit-car/:id',
  

  
  // Admin routes
  ADMIN: '/admin',
  ADMIN_OVERVIEW: '/admin/overview',
  ADMIN_USERS: '/admin/users',
  ADMIN_CONTENT: '/admin/content',
  ADMIN_OPERATIONS: '/admin/operations',
};

/**
 * Generate a URL with path parameters replaced by actual values
 * @param route Route pattern with path parameters
 * @param params Object containing parameter values
 * @returns URL with parameters filled in
 */
export function generatePath(route: string, params?: Record<string, string>): string {
  if (!params) return route;
  
  let path = route;
  Object.entries(params).forEach(([key, value]) => {
    path = path.replace(`:${key}`, value);
  });
  
  return path;
}


