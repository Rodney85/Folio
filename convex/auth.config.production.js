export default {
  providers: [
    {
      // Production Clerk issuer domain - must match JWT iss claim
      "domain": "https://carfolio.clerk.com",
      "applicationID": "convex"
    }
  ],
};
