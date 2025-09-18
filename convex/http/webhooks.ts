import { httpAction, ActionCtx } from "../_generated/server";
import { internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";

// Define webhook data types
interface WebhookData {
  id: string | number;
  attributes: WebhookAttributes;
}

interface WebhookAttributes {
  customer_id?: string | number;
  custom_data?: { userId?: string };
  variant_name?: string;
  renews_at?: string;
  ends_at?: string | null;
  status?: string;
  order_number?: string;
  total?: number;
  currency?: string;
  created_at?: string;
}

// Lemon Squeezy configuration
const LEMON_SQUEEZY_WEBHOOK_SECRET = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET!;

/**
 * Handle webhook events from Lemon Squeezy
 * This endpoint processes subscription events like created, updated, cancelled
 */
export const handleWebhook = httpAction(async (ctx, request) => {
  // Verify the request is from Lemon Squeezy
  const signature = request.headers.get("X-Signature");
  if (!signature) {
    return new Response(JSON.stringify({ error: "Missing signature" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Parse the webhook payload
    const payload = await request.json();
    const { meta, data } = payload;
    
    // Log the webhook event for debugging
    console.log(`Received webhook: ${meta.event_name}`);

    // Handle different webhook events
    switch (meta.event_name) {
      case "subscription_created":
        await handleSubscriptionCreated(ctx, data);
        break;
      
      case "subscription_updated":
        await handleSubscriptionUpdated(ctx, data);
        break;
      
      case "subscription_cancelled":
        await handleSubscriptionCancelled(ctx, data);
        break;
        
      case "order_created":
        await handleOrderCreated(ctx, data);
        break;
        
      default:
        console.log(`Unhandled webhook event: ${meta.event_name}`);
    }
    
    // Return success
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error handling webhook:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

/**
 * Handle subscription created event
 */
async function handleSubscriptionCreated(ctx: ActionCtx, data: WebhookData) {
  const attributes = data.attributes;
  const customData = attributes.custom_data || {};
  
  // Extract customer ID from the subscription data
  const customerId = attributes.customer_id;
  
  // Extract user ID from custom data (set during checkout)
  const userId = customData.userId;
  
  if (!userId) {
    console.error("Missing user ID in subscription created webhook");
    return;
  }
  
  // Create or update subscription in our database
  await ctx.runMutation(internal.subscriptions.createOrUpdateSubscription, {
    userId,
    customerId: String(customerId),
    subscriptionId: String(data.id),
    status: "active",
    plan: attributes.variant_name?.toLowerCase()?.includes("monthly") ? "monthly" : "yearly",
    currentPeriodEnd: attributes.renews_at,
    cancelAtPeriodEnd: false,
    createdAt: new Date().toISOString(),
  });
}

/**
 * Handle subscription updated event
 */
async function handleSubscriptionUpdated(ctx: ActionCtx, data: WebhookData) {
  const attributes = data.attributes;
  
  // Update subscription in our database
  await ctx.runMutation(internal.subscriptions.updateSubscription, {
    subscriptionId: String(data.id),
    status: attributes.status === "active" ? "active" : "paused",
    currentPeriodEnd: attributes.renews_at,
    cancelAtPeriodEnd: attributes.ends_at !== null,
  });
}

/**
 * Handle subscription cancelled event
 */
async function handleSubscriptionCancelled(ctx: ActionCtx, data: WebhookData) {
  const attributes = data.attributes;
  
  // Update subscription in our database
  await ctx.runMutation(internal.subscriptions.cancelSubscription, {
    subscriptionId: String(data.id),
    canceledAt: new Date().toISOString(),
  });
}

/**
 * Handle order created event
 */
async function handleOrderCreated(ctx: ActionCtx, data: WebhookData) {
  const attributes = data.attributes;
  const customData = attributes.custom_data || {};
  
  // Extract user ID from custom data
  const userId = customData.userId;
  
  if (!userId) {
    console.error("Missing user ID in order created webhook");
    return;
  }
  
  // Record the order in our database
  await ctx.runMutation(internal.subscriptions.recordOrder, {
    userId,
    orderId: String(data.id),
    orderNumber: attributes.order_number,
    total: attributes.total,
    currency: attributes.currency,
    createdAt: attributes.created_at,
  });
}
