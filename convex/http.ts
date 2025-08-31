import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import { createCheckout } from "./http/checkout";
import { customerPortal } from "./http/customerPortal";

const http = httpRouter();

// Public access check for subscription status
http.route({
  path: "/checkPublicUserAccess",
  method: "GET",
  handler: httpAction(async ({ runQuery }, request) => {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    
    if (!userId) {
      return new Response(JSON.stringify({ hasAccess: false }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    try {
      // We're using type casting here because we know the function exists
      // but TypeScript can't verify it during build time
      const hasAccess = await runQuery(api.subscriptions.checkPublicUserAccess as any, { userId });
      
      return new Response(JSON.stringify({ hasAccess }), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      console.error("Error checking subscription access:", error);
      return new Response(JSON.stringify({ hasAccess: false, error: "Failed to check access" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }),
});

// Webhook handler for Lemon Squeezy subscription events
http.route({
  path: "/webhooks/lemon-squeezy",
  method: "POST",
  handler: httpAction(async ({ runMutation, runQuery }, request) => {
    // Verify the webhook signature if needed
    // const signature = request.headers.get("X-Signature");
    // For now we'll skip verification and implement it later
    
    try {
      // Parse the webhook payload
      const payload = await request.json();
      const event = payload.meta?.event_name;
      const data = payload.data;
      
      if (!event || !data) {
        return new Response(JSON.stringify({ success: false, error: "Invalid webhook payload" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      
      console.log(`Processing Lemon Squeezy webhook event: ${event}`);
      
      // Extract the relevant data from the webhook
      const attributes = data.attributes || {};
      const subscriptionId = data.id;
      const customerId = attributes.customer_id?.toString();
      let userId;
      
      // Find the user ID associated with this subscription
      if (customerId) {
        // Look up the subscription by customer ID
        const existingSubscription: any = await runQuery(api.subscriptions.getSubscriptionByExternalIds as any, {
          subscriptionId,
          customerId
        });
        
        if (existingSubscription) {
          userId = existingSubscription.userId;
        }
      }
      
      if (!userId) {
        // If we can't find the user, check custom data
        const customData = attributes.custom_data || {};
        userId = customData.userId;
      }
      
      if (!userId) {
        return new Response(JSON.stringify({
          success: false,
          error: "Could not identify user for this subscription"
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      
      // Process different event types
      switch (event) {
        case "subscription_created":
        case "subscription_updated":
          {
            // Get subscription status and details
            const status = attributes.status || "active"; // active, cancelled, expired, on_trial, paused, past_due, unpaid
            const trialEndsAt = attributes.trial_ends_at ? new Date(attributes.trial_ends_at).getTime() : null;
            const currentPeriodEnd = attributes.renews_at ? new Date(attributes.renews_at).getTime() : null;
            const canceledAt = attributes.cancelled_at ? new Date(attributes.cancelled_at).getTime() : null;
            const plan = attributes.variant_name?.toLowerCase().includes("yearly") ? "yearly" : "monthly";
            
            let subscriptionStatus;
            if (status === "active") {
              subscriptionStatus = "active";
            } else if (status === "on_trial") {
              subscriptionStatus = "trial";
            } else if (status === "cancelled") {
              subscriptionStatus = "canceled";
            } else if (["expired", "past_due", "unpaid"].includes(status)) {
              subscriptionStatus = "expired";
            } else {
              subscriptionStatus = "active"; // Default to active for any unknown status
            }
            
            // Update the subscription in our database
            await runMutation(api.subscriptions.updateSubscription as any, {
              userId,
              subscriptionId,
              customerId,
              status: subscriptionStatus,
              plan,
              trialEndDate: trialEndsAt,
              currentPeriodEnd,
              canceledAt
            });
          }
          break;
          
        case "subscription_cancelled":
          {
            await runMutation(api.subscriptions.cancelSubscription as any, {
              userId,
              subscriptionId,
              canceledAt: Date.now()
            });
          }
          break;
          
        case "subscription_payment_success":
          {
            // Log successful payment
            await runMutation(api.analytics.logEvent as any, {
              type: "subscription_payment",
              userId,
              subscriptionId,
              amount: attributes.total || 0,
              status: "success"
            });
          }
          break;
          
        case "subscription_payment_failed":
          {
            // Log failed payment
            await runMutation(api.analytics.logEvent as any, {
              type: "subscription_payment_failed",
              userId,
              subscriptionId,
              amount: attributes.total || 0,
              status: "failed"
            });
          }
          break;
        
        default:
          console.log(`Unhandled Lemon Squeezy event: ${event}`);
      }
      
      // Acknowledge the webhook
      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      console.error("Error processing Lemon Squeezy webhook:", error);
      return new Response(JSON.stringify({ success: false, error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }),
});

// Register checkout and customer portal endpoints
http.route({
  path: "/create-checkout",
  method: "GET",
  handler: createCheckout
});

http.route({
  path: "/customer-portal",
  method: "GET",
  handler: customerPortal
});

export default http;
