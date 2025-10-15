import { ConvexError, v } from "convex/values";
import { internalMutation } from "../_generated/server";
import { SubscriptionStatus } from "../subscriptions";
import { Doc, Id } from "../_generated/dataModel";

/**
 * Create or update a subscription based on webhook data from Dodo Payments
 * This is called by webhooks when subscription status changes
 */
export const createOrUpdateSubscription = internalMutation({
  args: {
    userId: v.string(),
    customerId: v.string(),
    subscriptionId: v.string(),
    status: v.string(), // "active", "trial", "on_hold", "failed", etc.
    plan: v.string(), // "monthly" or "yearly"
    currentPeriodEnd: v.optional(v.union(v.string(), v.number())),
    cancelAtPeriodEnd: v.optional(v.boolean()),
    createdAt: v.optional(v.union(v.string(), v.number())),
  },
  handler: async (ctx, args) => {
    // Find existing subscription
    const existingSubscription = await ctx.db
      .query("subscriptions")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    const now = Date.now();

    // Convert currentPeriodEnd to timestamp
    let currentPeriodEnd: number | null = null;
    if (args.currentPeriodEnd) {
      currentPeriodEnd = typeof args.currentPeriodEnd === 'number'
        ? args.currentPeriodEnd
        : new Date(args.currentPeriodEnd).getTime();
    }

    // Determine trial end date (for trial status, currentPeriodEnd is when trial ends)
    const trialEndDate = args.status === "trial" ? currentPeriodEnd : now;

    if (existingSubscription) {
      // Update existing subscription
      await ctx.db.patch(existingSubscription._id, {
        status: args.status,
        plan: args.plan,
        subscriptionId: args.subscriptionId,
        customerId: args.customerId,
        currentPeriodEnd,
        trialEndDate: args.status === "trial" ? (currentPeriodEnd || now) : existingSubscription.trialEndDate,
        updatedAt: now,
      });

      // Track analytics event
      await ctx.db.insert("analytics", {
        userId: args.userId,
        type: args.status === "active" ? "subscription_activated" : "subscription_updated",
        createdAt: now,
        metadata: {
          plan: args.plan,
          status: args.status,
          fromTrial: existingSubscription.status === SubscriptionStatus.TRIAL
        }
      });

    } else {
      // Create a new subscription
      await ctx.db.insert("subscriptions", {
        userId: args.userId,
        status: args.status,
        plan: args.plan,
        trialStartDate: args.status === "trial" ? now : now,
        trialEndDate: trialEndDate || now,
        subscriptionId: args.subscriptionId,
        customerId: args.customerId,
        currentPeriodEnd,
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
          plan: args.plan,
          status: args.status
        }
      });
    }

    return { success: true };
  },
});

/**
 * Update an existing subscription (for renewals, status changes, etc.)
 * Called by webhooks when subscription details change
 */
export const updateSubscription = internalMutation({
  args: {
    subscriptionId: v.string(),
    status: v.string(),
    currentPeriodEnd: v.optional(v.union(v.string(), v.number())),
    cancelAtPeriodEnd: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Find subscription by external ID
    const subscription = await ctx.db
      .query("subscriptions")
      .filter((q) => q.eq(q.field("subscriptionId"), args.subscriptionId))
      .first();

    if (!subscription) {
      console.error(`Subscription not found: ${args.subscriptionId}`);
      throw new ConvexError("Subscription not found");
    }

    const now = Date.now();

    // Convert currentPeriodEnd to timestamp
    let currentPeriodEnd: number | null = subscription.currentPeriodEnd;
    if (args.currentPeriodEnd) {
      currentPeriodEnd = typeof args.currentPeriodEnd === 'number'
        ? args.currentPeriodEnd
        : new Date(args.currentPeriodEnd).getTime();
    }

    // Update trial end date if moving from trial to active
    const trialEndDate = args.status === "active" && subscription.status === "trial"
      ? now
      : subscription.trialEndDate;

    // Update subscription
    await ctx.db.patch(subscription._id, {
      status: args.status,
      currentPeriodEnd,
      trialEndDate,
      updatedAt: now,
    });

    // Track analytics event
    await ctx.db.insert("analytics", {
      userId: subscription.userId,
      type: "subscription_updated",
      createdAt: now,
      metadata: {
        status: args.status,
        previousStatus: subscription.status,
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
    canceledAt: v.union(v.string(), v.number()),
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
    const canceledAt = typeof args.canceledAt === 'number'
      ? args.canceledAt
      : new Date(args.canceledAt).getTime();

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
