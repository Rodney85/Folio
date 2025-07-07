import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";

/**
 * Create or update a user profile in the Convex database.
 * Called after Clerk authentication and from the profile edit page.
 */
export const updateProfile = mutation({
  args: {
    username: v.optional(v.string()),
    bio: v.optional(v.string()),
    instagram: v.optional(v.string()),
    tiktok: v.optional(v.string()),
    youtube: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    // Extract user information from the token
    const tokenIdentifier = identity.tokenIdentifier;
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", tokenIdentifier))
      .first();

    const currentTimestamp = new Date().toISOString();

    if (existingUser) {
      // Update existing user
      return await ctx.db.patch(existingUser._id, {
        ...(args.username !== undefined ? { username: args.username } : {}),
        ...(args.bio !== undefined ? { bio: args.bio } : {}),
        ...(args.instagram !== undefined ? { instagram: args.instagram } : {}),
        ...(args.tiktok !== undefined ? { tiktok: args.tiktok } : {}),
        ...(args.youtube !== undefined ? { youtube: args.youtube } : {}),
        profileCompleted: true,
        updatedAt: currentTimestamp,
      });
    } else {
      // This case shouldn't happen often as users are typically created during auth sync
      throw new ConvexError("User not found in the database");
    }
  },
});

/**
 * Get the user's profile data.
 */
export const getProfile = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null; // Not authenticated
    }

    // Look up the user in the database
    const tokenIdentifier = identity.tokenIdentifier;
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", tokenIdentifier))
      .first();

    return user;
  },
});

/**
 * Check if the user has completed their profile setup.
 * Used to determine if we should show the onboarding flow.
 */
export const isProfileComplete = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return false; // Not authenticated
    }

    // Look up the user
    const tokenIdentifier = identity.tokenIdentifier;
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", tokenIdentifier))
      .first();

    if (!user) {
      return false; // User not found
    }

    // Consider profile complete if username is set and profileCompleted flag is true
    return user.profileCompleted === true && !!user.username;
  },
});
