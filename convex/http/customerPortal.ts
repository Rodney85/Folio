import { httpAction } from "../_generated/server";
import { api } from "../_generated/api";

// Lemon Squeezy configuration
const LEMON_SQUEEZY_API_KEY = process.env.LEMON_SQUEEZY_API_KEY!;
const APP_URL = process.env.APP_URL || "http://localhost:5173";

/**
 * Generate a customer portal URL for managing subscription
 * 
 * @param subscriptionId - The Lemon Squeezy subscription ID
 * @returns Redirect to Lemon Squeezy customer portal
 */
export const customerPortal = httpAction(async (ctx, request) => {
  // Parse query parameters
  const url = new URL(request.url);
  const subscriptionId = url.searchParams.get("subscriptionId");
  
  if (!subscriptionId) {
    return new Response(JSON.stringify({ error: "Missing subscription ID" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  
  try {
    // Get the subscription from our database to find the customer ID
    const subscription = await ctx.runQuery(api.subscriptions.getSubscriptionByExternalIds, { 
      subscriptionId 
    });
    
    if (!subscription || !subscription.customerId) {
      return new Response(JSON.stringify({ error: "Subscription not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    // Create customer portal URL with Lemon Squeezy API
    const response = await fetch(`https://api.lemonsqueezy.com/v1/customers/${subscription.customerId}/portal-url`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${LEMON_SQUEEZY_API_KEY}`,
      },
      body: JSON.stringify({
        data: {
          type: "customer-portal-url",
          attributes: {
            return_url: `${APP_URL}/subscription`,
          },
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Lemon Squeezy customer portal creation failed:", errorData);
      return new Response(JSON.stringify({ error: "Failed to create customer portal link" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const portalUrl = data.data.attributes.url;
    
    // Redirect the user to the portal URL
    return new Response(null, {
      status: 302,
      headers: {
        Location: portalUrl,
      },
    });
  } catch (error) {
    console.error("Error creating customer portal:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
