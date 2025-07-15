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
      return await ctx.db.patch(user._id, {
        name: args.name ?? user.name,
        email: args.email ?? user.email,
        pictureUrl: args.pictureUrl ?? user.pictureUrl,
      });
    }
    
    // User doesn't exist, create a new user
    return await ctx.db.insert("users", {
      name: args.name ?? identity.name ?? "",
      email: args.email ?? identity.email ?? "",
      pictureUrl: args.pictureUrl ?? identity.pictureUrl,
      tokenIdentifier: identity.tokenIdentifier,
    });
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
    };
  },
});
