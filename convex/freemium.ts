import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Freemium Access Control — CarFolio
 * 
 * Tiers:
 * - Free:  3 cars, no affiliate links, CarFolio badge on profile
 * - Pro:   Unlimited cars, affiliate links, advanced analytics, no badge ($5.99/mo)
 * - OG:    Everything in Pro, forever. Founding Member badge. ($49 one-time)
 * 
 * Toggle BETA_MODE to switch between beta (all access) and production (gated).
 */

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION — Flip this to false when Dodo Payments are live
// ═══════════════════════════════════════════════════════════════
const BETA_MODE = process.env.BETA_MODE === "true";

// Free tier limits
export const FREE_CAR_LIMIT = 3;

// ═══════════════════════════════════════════════════════════════
// HELPER
// ═══════════════════════════════════════════════════════════════

// Helper to get user by token identifier (matches how we store them)
export async function getUserFromIdentity(ctx: any, tokenIdentifier: string) {
    return await ctx.db
        .query("users")
        .withIndex("by_token", (q: any) => q.eq("tokenIdentifier", tokenIdentifier))
        .unique();
}

// Helper to check premium status (reusable in mutations)
export async function checkIsPremium(ctx: any, tokenIdentifier: string) {
    if (BETA_MODE) return true;
    const user = await getUserFromIdentity(ctx, tokenIdentifier);
    return user?.subscriptionStatus === "active";
}

// ═══════════════════════════════════════════════════════════════
// QUERIES
// ═══════════════════════════════════════════════════════════════

/**
 * Check if the current user has premium access (Pro or OG).
 */
export const isPremiumUser = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return false;

        if (BETA_MODE) return true;

        const user = await getUserFromIdentity(ctx, identity.tokenIdentifier);
        if (!user) return false;

        return user.subscriptionStatus === "active";
    },
});

/**
 * Check if the current user can add a car.
 * Free: 3 car limit | Pro/OG: unlimited
 */
export const canAddCar = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return false;

        if (BETA_MODE) return true;

        const user = await getUserFromIdentity(ctx, identity.tokenIdentifier);
        if (!user) return false;

        // Pro/OG have no limit
        if (user.subscriptionStatus === "active") return true;

        // Free tier: check car count against limit
        const userCars = await ctx.db
            .query("cars")
            .withIndex("by_user", (q: any) => q.eq("userId", identity.subject))
            .collect();

        return userCars.length < FREE_CAR_LIMIT;
    },
});

/**
 * Check if the current user can use affiliate links.
 * Free: NO affiliate links | Pro/OG: full affiliate links
 */
export const canUseAffiliateLinks = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return false;

        if (BETA_MODE) return true;

        const user = await getUserFromIdentity(ctx, identity.tokenIdentifier);
        if (!user) return false;

        return user.subscriptionStatus === "active";
    },
});

/**
 * Check if the current user can add mods/parts.
 * Free: Can add mods (but no affiliate links on them)
 * Pro/OG: Full mod access with affiliate links
 */
export const canAddMod = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return false;

        if (BETA_MODE) return true;

        // All users can add mods — the gate is on affiliate links, not mods themselves
        return true;
    },
});

/**
 * Check if a user's profile should be publicly visible.
 * All tiers get public profiles.
 */
export const isProfilePublic = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return false;

        if (BETA_MODE) return true;

        const user = await getUserFromIdentity(ctx, identity.tokenIdentifier);
        if (!user) return false;

        return true;
    },
});

/**
 * Get the premium status and tier for the current user.
 */
const OG_PRODUCT_ID = process.env.DODO_PRODUCT_OG_LIFETIME;

/**
 * Helper to determine the user's tier based on subscription status and plan ID.
 */
export function getUserTier(user: any): "free" | "pro" | "og" {
    if (!user || user.subscriptionStatus !== "active") {
        return "free";
    }

    // Check if the user has the OG lifetime plan
    if (OG_PRODUCT_ID && user.planId === OG_PRODUCT_ID) {
        return "og";
    }

    // Default to Pro if active but not OG (or if OG ID is not configured)
    return "pro";
}

/**
 * Get the premium status and tier for the current user.
 */
export const isUserPremium = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return { isPremium: false, tier: "guest" as const };
        }

        if (BETA_MODE) {
            return { isPremium: true, tier: "pro" as const };
        }

        const user = await getUserFromIdentity(ctx, identity.tokenIdentifier);
        if (!user) {
            return { isPremium: false, tier: "free" as const };
        }

        const tier = getUserTier(user);

        return {
            isPremium: tier !== "free",
            tier: tier,
        };
    },
});

/**
 * Get remaining car slots for the current user.
 */
export const getRemainingCarSlots = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return { remaining: 0, total: 0, unlimited: false };

        if (BETA_MODE) {
            return { remaining: 999, total: 999, unlimited: true };
        }

        const user = await getUserFromIdentity(ctx, identity.tokenIdentifier);
        if (!user) return { remaining: 0, total: 0, unlimited: false };

        // Pro/OG have unlimited
        if (user.subscriptionStatus === "active") {
            return { remaining: 999, total: 999, unlimited: true };
        }

        // Free: count existing cars
        const userCars = await ctx.db
            .query("cars")
            .withIndex("by_user", (q: any) => q.eq("userId", identity.subject))
            .collect();

        return {
            remaining: Math.max(0, FREE_CAR_LIMIT - userCars.length),
            total: FREE_CAR_LIMIT,
            unlimited: false,
        };
    },
});

/**
 * Get the tier of a specific user (publicly accessible).
 * Used for displaying badges and gating content on public profiles.
 */
export const getPublicUserTier = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        if (!user) return "free";
        return getUserTier(user);
    },
});

/**
 * Get the tier of a specific user by their token identifier (Clerk ID).
 * Used when we only have car.userId (which is a tokenIdentifier string).
 */
export const getPublicUserTierByToken = query({
    args: { tokenIdentifier: v.string() },
    handler: async (ctx, args) => {
        const user = await getUserFromIdentity(ctx, args.tokenIdentifier);
        if (!user) return "free";
        return getUserTier(user);
    },
});
