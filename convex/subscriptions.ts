import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// Subscription plans
export enum SubscriptionPlan {
  FREE = "free",
  STARTER = "starter",
  PRO = "pro",
}

// Helper to check if a user has at least the given plan level
export const hasSubscriptionAccess = (userPlan: string | undefined, requiredPlan: SubscriptionPlan): boolean => {
  if (!userPlan) return requiredPlan === SubscriptionPlan.FREE;
  
  // Plan hierarchy: free < starter < pro
  switch (requiredPlan) {
    case SubscriptionPlan.FREE:
      return true;
    case SubscriptionPlan.STARTER:
      return userPlan === SubscriptionPlan.STARTER || userPlan === SubscriptionPlan.PRO;
    case SubscriptionPlan.PRO:
      return userPlan === SubscriptionPlan.PRO;
    default:
      return false;
  }
};

// Query to check if a user has at least the specified plan access
export const checkUserPlanAccess = query({
  args: {
    requiredPlan: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return false;
    }

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("tokenIdentifier"), identity.tokenIdentifier))
      .first();

    if (!user) {
      return false;
    }

    // Check subscription status
    const now = Date.now();
    if (user.subscriptionEndDate && user.subscriptionEndDate < now) {
      // Subscription expired - user is on free plan
      return hasSubscriptionAccess(SubscriptionPlan.FREE, args.requiredPlan as SubscriptionPlan);
    }

    return hasSubscriptionAccess(user.subscriptionPlan, args.requiredPlan as SubscriptionPlan);
  },
});

// Temporary mock function to set user subscription plan (for testing until Paystack integration)
export const mockSetUserPlan = mutation({
  args: {
    plan: v.string(),
    durationDays: v.optional(v.number()), // Duration in days
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("tokenIdentifier"), identity.tokenIdentifier))
      .first();

    if (!user) {
      throw new ConvexError("User not found");
    }

    const durationMs = (args.durationDays || 30) * 24 * 60 * 60 * 1000;
    const endDate = Date.now() + durationMs;

    // Update user subscription
    await ctx.db.patch(user._id, {
      subscriptionPlan: args.plan,
      subscriptionEndDate: endDate,
      paymentProvider: "mock", // Will be replaced with 'paystack' when implemented
    });
    
    // NOTE: Since this is server-side code, we can't directly call Google Analytics here.
    // When implementing the real Paystack integration, make sure to track subscription
    // upgrades on the client side using the trackSubscriptionUpgrade function.

    return {
      plan: args.plan,
      endDate: new Date(endDate).toISOString(),
    };
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

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("tokenIdentifier"), identity.tokenIdentifier))
      .first();

    if (!user) {
      return null;
    }

    // Check if subscription is expired
    const now = Date.now();
    if (user.subscriptionEndDate && user.subscriptionEndDate < now) {
      return {
        plan: SubscriptionPlan.FREE,
        endDate: null,
        isActive: false,
      };
    }

    return {
      plan: user.subscriptionPlan || SubscriptionPlan.FREE,
      endDate: user.subscriptionEndDate ? new Date(user.subscriptionEndDate).toISOString() : null,
      isActive: !!user.subscriptionPlan && user.subscriptionPlan !== SubscriptionPlan.FREE,
      daysRemaining: user.subscriptionEndDate 
        ? Math.ceil((user.subscriptionEndDate - now) / (24 * 60 * 60 * 1000))
        : 0,
    };
  },
});
