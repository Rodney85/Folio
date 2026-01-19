import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// Helper function to get the current authenticated user
export const getUser = async (ctx: { auth: any }) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }
  return {
    id: identity.subject,
    name: identity.name,
    email: identity.email,
    pictureUrl: identity.pictureUrl,
  };
};

// Query to get the current user's data
export const me = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx);
    return user;
  },
});

// Mutation to store user data after authentication
export const storeUser = mutation({
  args: {
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    pictureUrl: v.optional(v.string()),
    username: v.optional(v.string()), // Add username parameter to sync from Clerk
    role: v.optional(v.string()), // Add role parameter to accept from Clerk
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Called storeUser without authentication present");
    }

    // Check if user already exists
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (user !== null) {
      // User exists, update their information
      const updateData: any = {
        name: args.name ?? user.name,
        email: args.email ?? user.email,
        pictureUrl: args.pictureUrl ?? user.pictureUrl,
        updatedAt: Date.now(),
      };

      // Update username if provided and user doesn't have one yet
      // This allows syncing Clerk username while preserving custom usernames
      if (args.username && !user.username) {
        updateData.username = args.username;
        // Don't auto-complete profile, let onboarding flow handle it
      }

      // Only update role if provided, otherwise keep existing
      if (args.role !== undefined) {
        updateData.role = args.role;
      }

      await ctx.db.patch(user._id, updateData);
      return user._id;
    }

    // User doesn't exist, create a new user
    const newUserData: any = {
      name: args.name ?? identity.name ?? "",
      email: args.email ?? identity.email ?? "",
      pictureUrl: args.pictureUrl ?? identity.pictureUrl,
      tokenIdentifier: identity.tokenIdentifier,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Include username if provided
    if (args.username) {
      newUserData.username = args.username;
      // Don't auto-complete profile, let onboarding flow handle it
    }

    // Include role if provided
    if (args.role !== undefined) {
      newUserData.role = args.role;
    }

    return await ctx.db.insert("users", newUserData);
  },
});

// Query to get a Convex user by Clerk ID
export const getConvexUser = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    // Skip query if no clerk ID provided
    if (args.clerkId === "skip") {
      return null;
    }

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Find the user in the database by tokenIdentifier
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("tokenIdentifier"), identity.tokenIdentifier))
      .first();

    if (!user) {
      return null;
    }

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      pictureUrl: user.pictureUrl,
      role: user.role, // Include role in the returned user object
    };
  },
});
