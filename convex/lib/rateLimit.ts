import { ConvexError } from "convex/values";

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

/**
 * In-memory rate limit tracker
 * Note: In a distributed environment, you'd want to use a shared store
 * For Convex, this works well since functions run on the same infrastructure
 */
const rateLimitCache = new Map<string, { count: number; resetTime: number }>();

/**
 * Check if an action is rate limited for a specific user
 * @param action - The action being performed
 * @param userId - The user's identifier
 * @returns true if the action should be allowed, throws if rate limited
 */
export function checkRateLimit(action: RateLimitAction, userId: string): void {
    const limit = RATE_LIMITS[action];
    const key = `${action}:${userId}`;
    const now = Date.now();

    const entry = rateLimitCache.get(key);

    if (!entry || now > entry.resetTime) {
        // First request or window has expired - start new window
        rateLimitCache.set(key, { count: 1, resetTime: now + limit.windowMs });
        return;
    }

    if (entry.count >= limit.max) {
        const waitTime = Math.ceil((entry.resetTime - now) / 1000);
        throw new ConvexError(
            `Rate limit exceeded for ${action}. Please wait ${waitTime} seconds before trying again.`
        );
    }

    // Increment counter
    entry.count++;
    rateLimitCache.set(key, entry);
}

/**
 * Clean up expired rate limit entries (call periodically)
 */
export function cleanupRateLimits(): void {
    const now = Date.now();
    for (const [key, entry] of rateLimitCache.entries()) {
        if (now > entry.resetTime) {
            rateLimitCache.delete(key);
        }
    }
}
