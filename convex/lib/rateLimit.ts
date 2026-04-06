import { ConvexError } from "convex/values";
import { v } from "convex/values";

/**
 * Rate limiting configuration for different actions
 * Each action has a maximum number of requests allowed within a time window
 */
export const RATE_LIMITS = {
    createCar: { max: 10, windowMs: 60000 }, // 10 cars per minute
    updateCar: { max: 30, windowMs: 60000 }, // 30 updates per minute
    deleteCar: { max: 10, windowMs: 60000 }, // 10 deletes per minute
    uploadFile: { max: 50, windowMs: 60000 }, // 50 uploads per minute
    createPart: { max: 30, windowMs: 60000 }, // 30 parts per minute
    updateProfile: { max: 20, windowMs: 60000 }, // 20 profile updates per minute
} as const;

export type RateLimitAction = keyof typeof RATE_LIMITS;
export async function checkRateLimit(
    ctx: any,
    action: RateLimitAction,
    userId: string
): Promise<void> {
    const limit = RATE_LIMITS[action];
    const key = `${action}:${userId}`;
    const now = Date.now();
    const windowMs = limit.windowMs;

    // Get or create rate limit document atomically
    let doc = await ctx.db
        .query("rate_limits")
        .withIndex("by_key", (q: any) => q.eq("key", key))
        .first();

    if (!doc) {
        // Create initial document
        try {
            await ctx.db.insert("rate_limits", {
                key,
                count: 1,
                resetAt: now + windowMs,
            });
            return; // Allowed
        } catch (error: any) {
            if (error.code === "unique_constraint_violation") {
                // Another request inserted concurrently, fetch it
                doc = await ctx.db
                    .query("rate_limits")
                    .withIndex("by_key", (q: any) => q.eq("key", key))
                    .first();
                if (!doc) {
                    // Very unlikely, but if still not found, retry insert or fail
                    throw new ConvexError("Rate limit system error: could not create record");
                }
            } else {
                throw error;
            }
        }
    }

    // Check if the window has expired
    if (now > doc.resetAt) {
        // Reset the counter atomically
        await ctx.db.patch(doc._id, {
            count: 1,
            resetAt: now + windowMs,
        });
        return; // Allowed (fresh window)
    }

    // Window not expired: check limit and increment atomically
    try {
        await ctx.db.patch(doc._id, {
            count: (currentCount: number) => {
                if (currentCount >= limit.max) {
                    const waitTime = Math.ceil((doc.resetAt - now) / 1000);
                    throw new ConvexError(
                        `Rate limit exceeded for ${action}. Please wait ${waitTime} seconds before trying again.`
                    );
                }
                return currentCount + 1;
            },
            // Also refresh resetAt? No, keep existing.
        });
    } catch (error: any) {
        // If our functional patch threw due to limit, rethrow
        if (error.message.includes("Rate limit exceeded")) {
            throw error;
        }
        throw error;
    }
}

/**
 * Clean up expired rate limit entries (optional maintenance job)
 * Can be called periodically to remove old records.
 */
export async function cleanupRateLimits(ctx: any): Promise<void> {
    const now = Date.now();
    // Delete all documents where resetAt is in the past
    // Note: This can be expensive if many rate limit records exist.
    // Consider using TTL or a cron job that runs less frequently.
    const expired = await ctx.db
        .query("rate_limits")
        .filter((q: any) => q.lt(q.field("resetAt"), now))
        .collect();

    for (const doc of expired) {
        await ctx.db.delete(doc._id);
    }
}
