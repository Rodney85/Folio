// Import environment helper
import { isDevelopment } from "./env.js";

// Get the domain based on environment
const getClerkDomain = () => {
  const isDev = isDevelopment();
  const domain = isDev ? "https://united-piglet-38.clerk.accounts.dev" : "https://carfolio.cc";
  
  // Log for debugging (will appear in Convex logs)
  console.log(`[AUTH CONFIG] Environment: ${isDev ? 'development' : 'production'}`);
  console.log(`[AUTH CONFIG] Using Clerk domain: ${domain}`);
  console.log(`[AUTH CONFIG] CONVEX_URL: ${process.env.CONVEX_URL}`);
  console.log(`[AUTH CONFIG] NODE_ENV: ${process.env.NODE_ENV}`);
  
  return domain;
};

export default {
  providers: [
    {
      "domain": getClerkDomain(),
      "applicationID": "convex"
    }
  ],
};