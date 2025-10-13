import { query } from "./_generated/server";

/**
 * Debug query to check authentication and data
 */
export const debugAuth = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return {
        authenticated: false,
        message: "Not authenticated - identity is null",
        hint: "Make sure you are logged in with Clerk and that VITE_CLERK_PUBLISHABLE_KEY is set correctly"
      };
    }

    // Get user from database
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("tokenIdentifier"), identity.tokenIdentifier))
      .first();

    // Get subscription from database
    const subscription = await ctx.db
      .query("subscriptions")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .first();

    // Get all subscriptions to see what is in the database
    const allSubscriptions = await ctx.db.query("subscriptions").collect();

    return {
      authenticated: true,
      identity: {
        subject: identity.subject,
        tokenIdentifier: identity.tokenIdentifier,
        email: identity.email,
        name: identity.name,
      },
      user: user ? {
        _id: user._id,
        email: user.email,
        name: user.name,
        username: user.username,
      } : null,
      subscription: subscription ? {
        _id: subscription._id,
        userId: subscription.userId,
        status: subscription.status,
        plan: subscription.plan,
      } : null,
      allSubscriptionsCount: allSubscriptions.length,
      allSubscriptionsUserIds: allSubscriptions.map(s => s.userId),
    };
  },
});
