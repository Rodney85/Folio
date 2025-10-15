import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// Subscription status
export enum SubscriptionStatus {
  TRIAL = "trial",
  ACTIVE = "active",
  EXPIRED = "expired",
  CANCELED = "canceled"
}

// Subscription plans
export enum SubscriptionPlan {
  MONTHLY = "monthly",
  YEARLY = "yearly"
}

// Trial duration in milliseconds (7 days)
const TRIAL_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

// Helper to check if a user has an active subscription or is in trial
export const hasSubscriptionAccess = async (ctx: any, userId: string): Promise<boolean> => {
  // Check if user is admin by getting their identity
  const identity = await ctx.auth.getUserIdentity();
  if (identity) {
    // Check if user has admin role in Clerk metadata
    // Note: This is a simplified check - in practice you'd want more robust admin checking
    const user = await ctx.db
      .query("users")
      .filter(q => q.eq(q.field("tokenIdentifier"), identity.tokenIdentifier))
      .first();
    
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
    
    // Check for admin role in public metadata
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
  
  // User has access if they're in trial period or have an active subscription
  return (
    (subscription.status === SubscriptionStatus.TRIAL && subscription.trialEndDate > now) ||
    subscription.status === SubscriptionStatus.ACTIVE
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

// Create or start a trial subscription for a new user
export const startUserTrial = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }
    
    const userId = identity.subject;
    
    // Check if user already has a subscription
    const existingSubscription = await ctx.db
      .query("subscriptions")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();
      
    if (existingSubscription) {
      return existingSubscription;
    }
    
    // Create a new trial subscription
    const now = Date.now();
    const trialEndDate = now + TRIAL_DURATION_MS;
    
    const subscriptionId = await ctx.db.insert("subscriptions", {
      userId,
      status: SubscriptionStatus.TRIAL,
      plan: "", // Empty since they're on trial
      trialStartDate: now,
      trialEndDate,
      subscriptionId: null,
      customerId: null,
      currentPeriodEnd: null,
      canceledAt: null,
      createdAt: now,
      updatedAt: now,
    });
    
    // Track analytics event for trial start
    await ctx.db.insert("analytics", {
      userId,
      type: "trial_started",
      createdAt: now,
    });
    
    return await ctx.db.get(subscriptionId);
  },
});

// Update subscription from Lemon Squeezy checkout
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
        status: SubscriptionStatus.ACTIVE,
        plan: args.plan,
        subscriptionId: args.subscriptionId,
        customerId: args.customerId,
        currentPeriodEnd: args.currentPeriodEnd,
        updatedAt: now,
      });
    } else {
      // Create a new subscription (shouldn't normally happen)
      return await ctx.db.insert("subscriptions", {
        userId: args.userId,
        status: SubscriptionStatus.ACTIVE,
        plan: args.plan,
        trialStartDate: now,
        trialEndDate: now, // Trial is over since they're directly subscribing
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
    
    // Here you would call Lemon Squeezy API to cancel the subscription
    // This would be handled via a separate function or webhook
    
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
    // This handles old data that might use different ID formats
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
      // No subscription found, user might need to start trial
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
      trialEnded: subscription.status === SubscriptionStatus.TRIAL && subscription.trialEndDate <= now,
      daysRemaining: daysRemaining,
      trialEndDate: subscription.trialEndDate ? new Date(subscription.trialEndDate).toISOString() : null,
      currentPeriodEnd: subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toISOString() : null,
    };
  },
});

// Check for trial expiration and update status
export const checkAndUpdateTrialStatus = mutation({
  args: {},
  handler: async (ctx) => {
    // Get all trial subscriptions that might be expired
    const now = Date.now();
    const expiredTrials = await ctx.db
      .query("subscriptions")
      .filter((q) => 
        q.and(
          q.eq(q.field("status"), SubscriptionStatus.TRIAL),
          q.lt(q.field("trialEndDate"), now)
        )
      )
      .collect();
      
    // Update all expired trials
    for (const trial of expiredTrials) {
      await ctx.db.patch(trial._id, {
        status: SubscriptionStatus.EXPIRED,
        updatedAt: now,
      });
      
      // Track analytics event for trial expiration
      await ctx.db.insert("analytics", {
        userId: trial.userId,
        type: "trial_expired",
        createdAt: now,
      });
    }
    
    return { updatedCount: expiredTrials.length };
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
    
    // Check if user is admin by email domain or specific email
    // This approach depends on how admins are identified in your system
    const email = identity.email;
    const isAdmin = email && (
      email.endsWith("@carfolio.cc") || 
      email === "admin@example.com" // Replace with actual admin email
    );
    
    if (!user || !isAdmin) {
      throw new Error("Not authorized");
    }

    return await ctx.db.query("subscriptions").collect();
  },
});

/**
 * Get subscription by external IDs from Lemon Squeezy
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
