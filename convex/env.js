// Helper module to determine the current environment for Convex
// This is used by auth.config.js to select the correct auth provider

// Check for environment variables that would indicate development mode
export function isDevelopment() {
  // Check the explicitly set NODE_ENV environment variable
  // Set this in your Convex dashboard: Settings > Environment Variables
  // - Development deployment: NODE_ENV=development
  // - Production deployment: NODE_ENV=production
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  // Default to production for safety
  return false;
}
