import { httpRouter } from "convex/server";

/**
 * HTTP router for public access endpoints
 */
const http = httpRouter();

/**
 * Endpoint to check if a user has subscription access for public profile viewing
 * During development, this will always return true to allow testing
 */
http.route({
  path: "/checkPublicUserAccess",
  method: "GET",
  handler: async (ctx, request) => {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return new Response(
        JSON.stringify({ hasAccess: false, error: "Missing userId" }),
        { 
          status: 400, 
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // DEVELOPMENT MODE: Always allow access regardless of subscription status
    // REMOVE THIS WHEN IMPLEMENTING REAL SUBSCRIPTIONS
    return new Response(
      JSON.stringify({ hasAccess: true }),
      { 
        status: 200, 
        headers: { "Content-Type": "application/json" }
      }
    );
    
    // Uncomment for production implementation:
    // const hasAccess = await ctx.runQuery(api.subscriptions.checkPublicUserAccess, { userId });
    // return new Response(
    //   JSON.stringify({ hasAccess }),
    //   { 
    //     status: 200, 
    //     headers: { "Content-Type": "application/json" } 
    //   }
    // );
  },
});

export default http;
