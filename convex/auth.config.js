// Use CLERK_DOMAIN environment variable set in Convex dashboard
// This must match the issuer in JWT tokens from Clerk
// Development: https://united-piglet-38.clerk.accounts.dev
// Production: https://carfolio.clerk.com

const clerkDomain = process.env.CLERK_DOMAIN;

if (!clerkDomain) {
  throw new Error("CLERK_DOMAIN environment variable is required. Set it in the Convex dashboard.");
}

export default {
  providers: [
    {
      "domain": clerkDomain,
      "applicationID": "convex"
    }
  ],
};