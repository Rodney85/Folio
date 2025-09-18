// Get the domain from environment variables or fall back to development domain
const clerkDomain = process.env.CLERK_DOMAIN || "https://united-piglet-38.clerk.accounts.dev";

export default {
  providers: [
    {
      "domain": clerkDomain,
      "applicationID": "convex"
    }
  ],
};