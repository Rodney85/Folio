// Helper module to determine the current environment for Convex
// This is used by auth.config.js to select the correct auth provider

// Check for environment variables that would indicate development mode
export function isDevelopment() {
  // First check the explicitly set NODE_ENV
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  
  // Check for development Convex URL
  if (process.env.CONVEX_URL && 
      (process.env.CONVEX_URL.includes('proficient-alpaca') || 
       process.env.CONVEX_URL.includes('localhost'))) {
    return true;
  }
  
  // Default to production if we can't determine
  return false;
}
