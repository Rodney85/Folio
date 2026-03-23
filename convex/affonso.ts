import { v } from "convex/values";
import { action } from "./_generated/server";
import { ConvexError } from "convex/values";

/**
 * Generates an embedded dashboard token for Affonso.
 * Retrieves the current authenticated user's details and fetches a token
 * from the Affonso API to render the iframe dashboard securely.
 */
export const getEmbedToken = action({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Must be logged in to view affiliate dashboard");
    }

    const apiKey = process.env.AFFONSO_API_KEY;
    const programId = process.env.AFFONSO_PROGRAM_ID;

    if (!apiKey || !programId) {
      throw new ConvexError("Affonso API keys are not configured");
    }

    try {
      const response = await fetch("https://api.affonso.io/v1/embed/token", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          programId,
          partner: {
            email: identity.email,
            name: identity.name || identity.email?.split("@")[0],
            image: identity.pictureUrl,
          },
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("Affonso API Error:", response.status, errText);
        throw new ConvexError("Failed to generate affiliate dashboard token");
      }

      const { data } = await response.json();
      
      // We return the fields required by the frontend
      return {
        publicToken: String(data.publicToken),
        expiresAt: String(data.expiresAt),
        link: String(data.link),
        partnershipStatus: String(data.partnershipStatus),
      };
    } catch (error) {
      console.error("Error fetching Affonso embed token:", error);
      throw new ConvexError("Could not retrieve affiliate token");
    }
  },
});
