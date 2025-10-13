// Helper module to determine the current environment for Convex
// This is used by auth.config.js to select the correct auth provider

// Check for environment variables that would indicate development mode
export function isDevelopment() {
  // First check the explicitly set NODE_ENV
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  
  // Check for development Convex URL patterns
  if (process.env.CONVEX_URL) {
    const url = process.env.CONVEX_URL;
    if (url.includes('proficient-alpaca') || 
        url.includes('localhost') ||
        url.includes('127.0.0.1')) {
      return true;
    }
  }
  
  // Check for production Convex URL patterns
  if (process.env.CONVEX_URL && 
      process.env.CONVEX_URL.includes('cheerful-nightingale')) {
    return false; // This is production
  }
  
  // Default to production if we can't determine
  return false;
}
