/**
 * User ID Helper Functions
 *
 * Provides consistent user ID handling across the entire codebase.
 * Handles different ID formats: Clerk IDs, token identifiers, and Convex database IDs.
 */

import { QueryCtx, MutationCtx } from "../_generated/server";
import { Doc } from "../_generated/dataModel";

/**
 * Get the current authenticated user's Clerk ID
 * This is the canonical user ID used throughout the app
 */
export async function getCurrentUserId(ctx: QueryCtx | MutationCtx): Promise<string | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  // identity.subject is the Clerk user ID (e.g., "user_2abc123...")
  return identity.subject;
}

/**
 * Get the current authenticated user's full identity and database record
 */
export async function getCurrentUser(ctx: QueryCtx | MutationCtx): Promise<{
  clerkId: string;
  tokenIdentifier: string;
  dbUser: Doc<"users"> | null;
} | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  // Look up user in database
  const dbUser = await ctx.db
    .query("users")
    .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
    .first();

  return {
    clerkId: identity.subject,
    tokenIdentifier: identity.tokenIdentifier,
    dbUser,
  };
}

/**
 * Find a user's database record by any ID format
 * Tries multiple strategies to find the user
 */
export async function findUserByAnyId(
  ctx: QueryCtx | MutationCtx,
  userId: string
): Promise<Doc<"users"> | null> {
  // Strategy 1: Check if it's a Convex database ID
  if (userId.length === 32 && !userId.includes("_") && !userId.includes("|")) {
    try {
      const user = await ctx.db.get(userId as any);
      if (user) return user as Doc<"users">;
    } catch {
      // Not a valid database ID, continue
    }
  }

  // Strategy 2: Check if it's a token identifier (contains |)
  if (userId.includes("|")) {
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", userId))
      .first();
    if (user) return user;
  }

  // Strategy 3: Extract Clerk ID from token identifier and search
  const clerkId = userId.includes("|") ? userId.split("|")[1] : userId;

  // Search by token identifier containing the Clerk ID
  const allUsers = await ctx.db.query("users").collect();
  const userByClerkId = allUsers.find((u) =>
    u.tokenIdentifier.includes(clerkId)
  );
  if (userByClerkId) return userByClerkId;

  return null;
}

/**
 * Get all possible user ID formats for a given user
 * Useful for querying data that might use different ID formats
 */
export async function getAllUserIdFormats(
  ctx: QueryCtx | MutationCtx,
  userId: string
): Promise<string[]> {
  const user = await findUserByAnyId(ctx, userId);
  if (!user) return [userId];

  const ids: string[] = [
    user._id, // Database ID
    user.tokenIdentifier, // Full token identifier
  ];

  // Extract Clerk ID from token identifier
  if (user.tokenIdentifier.includes("|")) {
    ids.push(user.tokenIdentifier.split("|")[1]);
  }

  return ids;
}

/**
 * Normalize user ID to Clerk ID format
 * Converts any ID format to the canonical Clerk user ID
 */
export async function normalizeToClerkId(
  ctx: QueryCtx | MutationCtx,
  userId: string
): Promise<string | null> {
  const user = await findUserByAnyId(ctx, userId);
  if (!user) return null;

  // Extract Clerk ID from token identifier
  if (user.tokenIdentifier.includes("|")) {
    return user.tokenIdentifier.split("|")[1];
  }

  return userId;
}
