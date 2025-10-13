import { httpAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { Webhook } from "standardwebhooks";

// Dodo Payments webhook secret for signature verification
const DODO_WEBHOOK_SECRET = process.env.DODO_WEBHOOK_SECRET!;

// Define Dodo Payments webhook data types based on their Standard Webhooks implementation
interface DodoWebhookPayload {
  type: string;
  data: {
    subscription_id?: string;
    customer_id?: string;
    status?: string;
    plan?: string;
    current_period_end?: string | number;
    cancel_at_period_end?: boolean;
    created_at?: string | number;
    metadata?: Record<string, any>;
  };
}

/**
 * Handle webhook events from Dodo Payments
 * Uses Standard Webhooks specification for signature verification
 *
 * Dodo Payments sends these headers:
 * - webhook-id: Unique webhook message ID
 * - webhook-signature: HMAC signature for verification
 * - webhook-timestamp: Timestamp of the webhook
 */
export const handleDodoWebhook = httpAction(async (ctx, request) => {
  try {
    // Get the raw body for signature verification
    const rawBody = await request.text();

    // Get webhook headers required for Standard Webhooks verification
    const webhookId = request.headers.get("webhook-id");
    const webhookSignature = request.headers.get("webhook-signature");
    const webhookTimestamp = request.headers.get("webhook-timestamp");

    if (!webhookId || !webhookSignature || !webhookTimestamp) {
      console.error("Missing required webhook headers");
      return new Response(JSON.stringify({ error: "Missing webhook headers" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Verify webhook signature using standardwebhooks library
    if (DODO_WEBHOOK_SECRET) {
      try {
        const wh = new Webhook(DODO_WEBHOOK_SECRET);

        // Verify will throw an error if signature is invalid
        wh.verify(rawBody, {
          "webhook-id": webhookId,
          "webhook-signature": webhookSignature,
          "webhook-timestamp": webhookTimestamp,
        });

        console.log("✅ Webhook signature verified successfully");
      } catch (error) {
        console.error("❌ Webhook signature verification failed:", error);
        return new Response(JSON.stringify({ error: "Invalid webhook signature" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
    } else {
      console.warn("⚠️ DODO_WEBHOOK_SECRET not set - skipping signature verification");
    }

    // Parse the verified payload
    let payload: DodoWebhookPayload;
    try {
      payload = JSON.parse(rawBody);
    } catch (parseError) {
      console.error("Invalid JSON payload:", parseError);
      return new Response(JSON.stringify({ error: "Invalid JSON payload" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate payload structure
    if (!payload.type || !payload.data) {
      console.error("Invalid webhook payload structure:", payload);
      return new Response(JSON.stringify({ error: "Invalid webhook payload structure" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log(`📬 Processing Dodo Payments webhook: ${payload.type}`);

    // Extract metadata to get our internal user ID
    const metadata = payload.data.metadata || {};
    const userId = metadata.userId || payload.data.customer_id;

    if (!userId) {
      console.error("No userId found in webhook payload");
      return new Response(JSON.stringify({ error: "Missing userId in payload" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Handle different webhook events according to Dodo Payments documentation
    switch (payload.type) {
      case "subscription.active":
      case "subscription.created":
        await ctx.runMutation(internal.subscriptions.createOrUpdateSubscription, {
          userId: userId,
          customerId: payload.data.customer_id || userId,
          subscriptionId: payload.data.subscription_id || "",
          status: "active",
          plan: payload.data.plan || metadata.plan || "monthly",
          currentPeriodEnd: payload.data.current_period_end,
          cancelAtPeriodEnd: payload.data.cancel_at_period_end || false,
          createdAt: payload.data.created_at,
        });
        console.log(`✅ Subscription activated for user: ${userId}`);
        break;

      case "subscription.updated":
      case "subscription.renewed":
        await ctx.runMutation(internal.subscriptions.updateSubscription, {
          subscriptionId: payload.data.subscription_id || "",
          status: "active",
          currentPeriodEnd: payload.data.current_period_end,
          cancelAtPeriodEnd: payload.data.cancel_at_period_end || false,
        });
        console.log(`✅ Subscription updated: ${payload.data.subscription_id}`);
        break;

      case "subscription.on_hold":
        await ctx.runMutation(internal.subscriptions.updateSubscription, {
          subscriptionId: payload.data.subscription_id || "",
          status: "on_hold",
          currentPeriodEnd: payload.data.current_period_end,
          cancelAtPeriodEnd: payload.data.cancel_at_period_end || false,
        });
        console.log(`⚠️ Subscription on hold: ${payload.data.subscription_id}`);
        break;

      case "subscription.failed":
        await ctx.runMutation(internal.subscriptions.updateSubscription, {
          subscriptionId: payload.data.subscription_id || "",
          status: "failed",
          currentPeriodEnd: payload.data.current_period_end,
          cancelAtPeriodEnd: payload.data.cancel_at_period_end || false,
        });
        console.log(`❌ Subscription failed: ${payload.data.subscription_id}`);
        break;

      case "subscription.cancelled":
      case "subscription.canceled":
        await ctx.runMutation(internal.subscriptions.cancelSubscription, {
          subscriptionId: payload.data.subscription_id || "",
          canceledAt: payload.data.created_at || Date.now(),
        });
        console.log(`🚫 Subscription canceled: ${payload.data.subscription_id}`);
        break;

      case "payment.succeeded":
        // Log successful payment for analytics
        console.log(`💰 Payment succeeded for subscription: ${payload.data.subscription_id}`);
        // Optionally update subscription status to ensure it's active
        if (payload.data.subscription_id) {
          await ctx.runMutation(internal.subscriptions.updateSubscription, {
            subscriptionId: payload.data.subscription_id,
            status: "active",
            currentPeriodEnd: payload.data.current_period_end,
          });
        }
        break;

      case "payment.failed":
        // Log failed payment
        console.log(`❌ Payment failed for subscription: ${payload.data.subscription_id}`);
        break;

      default:
        console.log(`ℹ️ Unhandled Dodo Payments webhook event: ${payload.type}`);
        // Still return success to prevent retries for unknown events
    }

    // Return success response (important for webhook delivery confirmation)
    return new Response(JSON.stringify({
      success: true,
      message: `Processed ${payload.type} event`,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Processed": "true"
      },
    });
  } catch (error) {
    console.error("❌ Error handling Dodo Payments webhook:", error);

    // Return a 500 error to trigger webhook retry from Dodo Payments
    return new Response(JSON.stringify({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Webhook processing failed",
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
