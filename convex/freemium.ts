import { query } from "./_generated/server";

/**
 * Freemium access control - BETA MODE
 * All users have full access during beta period.
 * Payment/subscription checks will be re-added after launch.
 */

/**
 * Check if the current user has premium access.
 * BETA: Always returns true - all users have full access.
 */
export const isPremiumUser = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return false;
        }
        // BETA: All authenticated users have premium access
        return true;
    },
});

/**
 * Check if the current user can add cars.
 * BETA: Always returns true for authenticated users.
 */
export const canAddCar = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return false;
        }
        // BETA: All authenticated users can add cars
        return true;
    },
});

/**
 * Check if the current user can add mods/parts.
 * BETA: Always returns true for authenticated users.
 */
export const canAddMod = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return false;
        }
        // BETA: All authenticated users can add mods
        return true;
    },
});

/**
 * Check if a user's profile should be publicly visible.
 * BETA: All authenticated users have public profiles.
 */
export const isProfilePublic = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return false;
        }
        // BETA: All authenticated users have public profiles
        return true;
    },
});

/**
 * Get the premium status for a specific user by their token identifier.
 * BETA: Always returns isPremium: true for authenticated users.
 */
export const isUserPremium = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            return { isPremium: false, role: null };
        }

        // BETA: All authenticated users are treated as premium
        return { isPremium: true, role: "beta_user" };
    },
});
