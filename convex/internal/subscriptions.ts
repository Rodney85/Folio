import { ConvexError, v } from "convex/values";
import { internalMutation } from "../_generated/server";
import { SubscriptionStatus } from "../subscriptions";
import { Doc, Id } from "../_generated/dataModel";

/**
 * Create or update a subscription based on webhook data
 */
export const createOrUpdateSubscription = internalMutation({
  args: {
    userId: v.string(),
    customerId: v.string(),
    subscriptionId: v.string(),
    status: v.string(),
    plan: v.string(),
    currentPeriodEnd: v.optional(v.string()),
    cancelAtPeriodEnd: v.optional(v.boolean()),
    createdAt: v.string(),
  },
  handler: async (ctx, args) => {
    // Find existing subscription
    const existingSubscription = await ctx.db
      .query("subscriptions")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();
    
    const now = Date.now();
    const currentPeriodEnd = args.currentPeriodEnd ? new Date(args.currentPeriodEnd).getTime() : null;
    
    if (existingSubscription) {
      // Update existing subscription
      await ctx.db.patch(existingSubscription._id, {
        status: SubscriptionStatus.ACTIVE,
        plan: args.plan,
        subscriptionId: args.subscriptionId,
        customerId: args.customerId,
        currentPeriodEnd,
        cancelAtPeriodEnd: args.cancelAtPeriodEnd,
        updatedAt: now,
        // If they had a trial, keep the trial dates for reference
      });
      
      // Track analytics event for subscription activation
      await ctx.db.insert("analytics", {
        userId: args.userId,
        type: "subscription_activated",
        createdAt: now,
        metadata: {
          plan: args.plan,
          fromTrial: existingSubscription.status === SubscriptionStatus.TRIAL
        }
      });
      
    } else {
      // Create a new subscription (shouldn't normally happen, but handle it)
      await ctx.db.insert("subscriptions", {
        userId: args.userId,
        status: SubscriptionStatus.ACTIVE,
        plan: args.plan,
        trialStartDate: null,
        trialEndDate: null, // No trial since they're directly subscribing
        subscriptionId: args.subscriptionId,
        customerId: args.customerId,
        currentPeriodEnd,
        cancelAtPeriodEnd: args.cancelAtPeriodEnd,
        canceledAt: null,
        createdAt: now,
        updatedAt: now,
      });
      
      // Track analytics event for new subscription
      await ctx.db.insert("analytics", {
        userId: args.userId,
        type: "subscription_created",
        createdAt: now,
        metadata: {
          plan: args.plan
        }
      });
    }
    
    return { success: true };
  },
});

/**
 * Update an existing subscription (for changes in billing period, etc.)
 */
export const updateSubscription = internalMutation({
  args: {
    subscriptionId: v.string(),
    status: v.string(),
    currentPeriodEnd: v.optional(v.string()),
    cancelAtPeriodEnd: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Find subscription by external ID
    const subscription = await ctx.db
      .query("subscriptions")
      .filter((q) => q.eq(q.field("subscriptionId"), args.subscriptionId))
      .first();
      
    if (!subscription) {
      throw new ConvexError("Subscription not found");
    }
    
    const now = Date.now();
    const currentPeriodEnd = args.currentPeriodEnd ? new Date(args.currentPeriodEnd).getTime() : null;
    
    // Update subscription
    await ctx.db.patch(subscription._id, {
      status: args.status === "active" ? SubscriptionStatus.ACTIVE : subscription.status,
      currentPeriodEnd,
      cancelAtPeriodEnd: args.cancelAtPeriodEnd,
      updatedAt: now,
    });
    
    // Track analytics event for subscription update
    await ctx.db.insert("analytics", {
      userId: subscription.userId,
      type: "subscription_updated",
      createdAt: now,
      metadata: {
        cancelAtPeriodEnd: args.cancelAtPeriodEnd
      }
    });
    
    return { success: true };
  },
});

/**
 * Cancel a subscription
 */
export const cancelSubscription = internalMutation({
  args: {
    subscriptionId: v.string(),
    canceledAt: v.string(),
  },
  handler: async (ctx, args) => {
    // Find subscription by external ID
    const subscription = await ctx.db
      .query("subscriptions")
      .filter((q) => q.eq(q.field("subscriptionId"), args.subscriptionId))
      .first();
      
    if (!subscription) {
      throw new ConvexError("Subscription not found");
    }
    
    const now = Date.now();
    const canceledAt = new Date(args.canceledAt).getTime();
    
    // Update subscription to canceled
    await ctx.db.patch(subscription._id, {
      status: SubscriptionStatus.CANCELED,
      canceledAt,
      updatedAt: now,
    });
    
    // Track analytics event for subscription cancellation
    await ctx.db.insert("analytics", {
      userId: subscription.userId,
      type: "subscription_canceled",
      createdAt: now
    });
    
    return { success: true };
  },
});

/**
 * Record an order (payment)
 */
export const recordOrder = internalMutation({
  args: {
    userId: v.string(),
    orderId: v.string(),
    orderNumber: v.string(),
    total: v.number(),
    currency: v.string(),
    createdAt: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Insert order record
    await ctx.db.insert("orders", {
      userId: args.userId,
      orderId: args.orderId,
      orderNumber: args.orderNumber,
      total: args.total,
      currency: args.currency,
      createdAt: new Date(args.createdAt).getTime(),
      recordedAt: now,
    });
    
    // Track analytics event for payment
    await ctx.db.insert("analytics", {
      userId: args.userId,
      type: "payment_received",
      createdAt: now,
      metadata: {
        orderId: args.orderId,
        total: args.total,
        currency: args.currency
      }
    });
    
    return { success: true };
  },
});
