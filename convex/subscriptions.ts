import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// Simplified subscription status - Dodo handles trials
export enum SubscriptionStatus {
  ACTIVE = "active",
  TRIAL = "trial", // Dodo trial period
  ON_HOLD = "on_hold",
  FAILED = "failed",
  CANCELED = "canceled",
  EXPIRED = "expired",
  NONE = "none"
}

// Subscription plans
export enum SubscriptionPlan {
  MONTHLY = "monthly",
  YEARLY = "yearly"
}

// Helper to check if a user has an active subscription
export const hasSubscriptionAccess = async (ctx: any, userId: string): Promise<boolean> => {
  // Check if user is admin by getting their identity
  const identity = await ctx.auth.getUserIdentity();
  if (identity) {
    // Admin email list - add admin emails here
    const adminEmails = [
      "admin@example.com",
      "creativesrodney@gmail.com", // Your admin email
    ];

    // If user has admin role, grant access without subscription
    if (identity.email && (
      identity.email.endsWith("@carfolio.cc") ||
      adminEmails.includes(identity.email.toLowerCase())
    )) {
      return true;
    }

    // Check for admin role in user record
    const user = await ctx.db
      .query("users")
      .filter(q => q.eq(q.field("tokenIdentifier"), identity.tokenIdentifier))
      .first();

    if (user && user.publicMetadata?.role === "admin") {
      return true;
    }
  }

  const subscription = await ctx.db
    .query("subscriptions")
    .filter((q) => q.eq(q.field("userId"), userId))
    .first();

  if (!subscription) {
    return false;
  }

  const now = Date.now();

  // User has access if they have an active or trial subscription
  return (
    subscription.status === SubscriptionStatus.ACTIVE ||
    (subscription.status === SubscriptionStatus.TRIAL && subscription.trialEndDate > now)
  );
};

// Query to check if a user has active subscription or trial access
export const checkUserAccess = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return false;
    }

    return hasSubscriptionAccess(ctx, identity.subject);
  },
});

// Query to check if a specific user ID has subscription access
// For use in public profile viewing
export const checkPublicUserAccess = query({
  args: {
    userId: v.string()
  },
  handler: async (ctx, args) => {
    return hasSubscriptionAccess(ctx, args.userId);
  },
});

// Update subscription from Dodo Payments checkout/webhook
// This mutation is called by webhooks, not directly by users
export const updateSubscription = mutation({
  args: {
    userId: v.string(),
    status: v.string(),
    plan: v.string(),
    subscriptionId: v.string(),
    customerId: v.string(),
    currentPeriodEnd: v.number(),
  },
  handler: async (ctx, args) => {
    // Find existing subscription
    const existingSubscription = await ctx.db
      .query("subscriptions")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    const now = Date.now();

    if (existingSubscription) {
      // Update existing subscription
      return await ctx.db.patch(existingSubscription._id, {
        status: args.status as SubscriptionStatus,
        plan: args.plan,
        subscriptionId: args.subscriptionId,
        customerId: args.customerId,
        currentPeriodEnd: args.currentPeriodEnd,
        updatedAt: now,
      });
    } else {
      // Create a new subscription
      return await ctx.db.insert("subscriptions", {
        userId: args.userId,
        status: args.status as SubscriptionStatus,
        plan: args.plan,
        trialStartDate: now,
        trialEndDate: args.currentPeriodEnd, // For trial, this is when trial ends
        subscriptionId: args.subscriptionId,
        customerId: args.customerId,
        currentPeriodEnd: args.currentPeriodEnd,
        canceledAt: null,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

// Cancel a subscription
export const cancelSubscription = mutation({
  args: {
    subscriptionId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const userId = identity.subject;

    // Find user's subscription
    const subscription = await ctx.db
      .query("subscriptions")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (!subscription) {
      throw new ConvexError("Subscription not found");
    }

    const now = Date.now();

    // Update subscription to canceled
    await ctx.db.patch(subscription._id, {
      status: SubscriptionStatus.CANCELED,
      canceledAt: now,
      updatedAt: now,
    });

    return { success: true };
  },
});

// Get user's current subscription details
export const getUserSubscription = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const clerkId = identity.subject;
    const tokenIdentifier = identity.tokenIdentifier;

    // Try to find subscription using multiple ID formats for compatibility
    let subscription = await ctx.db
      .query("subscriptions")
      .filter((q) => q.eq(q.field("userId"), clerkId))
      .first();

    // If not found with Clerk ID, try with token identifier
    if (!subscription) {
      subscription = await ctx.db
        .query("subscriptions")
        .filter((q) => q.eq(q.field("userId"), tokenIdentifier))
        .first();
    }

    // If still not found, try extracting Clerk ID from tokenIdentifier format
    if (!subscription && tokenIdentifier.includes("|")) {
      const extractedId = tokenIdentifier.split("|")[1];
      subscription = await ctx.db
        .query("subscriptions")
        .filter((q) => q.eq(q.field("userId"), extractedId))
        .first();
    }

    if (!subscription) {
      // No subscription found - user needs to subscribe
      return {
        status: "none",
        plan: "",
        isActive: false,
        isInTrial: false,
        daysRemaining: 0,
        trialEnded: false,
      };
    }

    // Check if subscription is active or in trial
    const now = Date.now();
    const isInTrial = subscription.status === SubscriptionStatus.TRIAL && subscription.trialEndDate > now;
    const isActive = subscription.status === SubscriptionStatus.ACTIVE;

    // Calculate days remaining
    let daysRemaining = 0;
    if (isInTrial) {
      daysRemaining = Math.ceil((subscription.trialEndDate - now) / (24 * 60 * 60 * 1000));
    } else if (isActive && subscription.currentPeriodEnd) {
      daysRemaining = Math.ceil((subscription.currentPeriodEnd - now) / (24 * 60 * 60 * 1000));
    }

    return {
      status: subscription.status,
      plan: subscription.plan,
      isActive: isActive,
      isInTrial: isInTrial,
      trialEnded: subscription.status === SubscriptionStatus.EXPIRED ||
                  (subscription.status === SubscriptionStatus.TRIAL && subscription.trialEndDate <= now),
      daysRemaining: daysRemaining,
      trialEndDate: subscription.trialEndDate ? new Date(subscription.trialEndDate).toISOString() : null,
      currentPeriodEnd: subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toISOString() : null,
      customerId: subscription.customerId,
      subscriptionId: subscription.subscriptionId,
    };
  },
});

// Get all subscription records - admin only
export const getAllSubscriptions = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .filter(q => q.eq(q.field("tokenIdentifier"), identity.tokenIdentifier))
      .first();

    // Check if user is admin
    const email = identity.email;
    const isAdmin = email && (
      email.endsWith("@carfolio.cc") ||
      email === "creativesrodney@gmail.com"
    );

    if (!user || !isAdmin) {
      throw new Error("Not authorized");
    }

    return await ctx.db.query("subscriptions").collect();
  },
});

/**
 * Get subscription by external IDs from Dodo Payments
 * Used by webhooks to find the corresponding subscription
 */
export const getSubscriptionByExternalIds = query({
  args: {
    subscriptionId: v.optional(v.string()),
    customerId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.subscriptionId && !args.customerId) {
      throw new Error("Either subscriptionId or customerId is required");
    }

    let subscription;

    // Try to find by subscription ID first
    if (args.subscriptionId) {
      subscription = await ctx.db
        .query("subscriptions")
        .filter(q => q.eq(q.field("subscriptionId"), args.subscriptionId))
        .first();
    }

    // If not found and customer ID is provided, try that
    if (!subscription && args.customerId) {
      subscription = await ctx.db
        .query("subscriptions")
        .filter(q => q.eq(q.field("customerId"), args.customerId))
        .first();
    }

    return subscription;
  },
});
