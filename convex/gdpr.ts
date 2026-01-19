import { mutation, query } from "./_generated/server";
import { ConvexError } from "convex/values";

/**
 * GDPR Compliance Module
 * Implements Article 17 (Right to erasure) and Article 20 (Right to data portability)
 */

/**
 * Permanently delete user account and all associated data.
 * GDPR Article 17 - Right to erasure ("right to be forgotten")
 */
export const deleteMyAccount = mutation({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new ConvexError("Not authenticated");
        }

        // Find the user
        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
            .first();

        if (!user) {
            throw new ConvexError("User not found");
        }

        const userId = identity.subject;
        const tokenIdentifier = identity.tokenIdentifier;

        // 1. Delete all user's mod hotspots, parts, and cars
        const userCars = await ctx.db
            .query("cars")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();

        for (const car of userCars) {
            // Get all images for this car to find hotspots
            if (car.images) {
                for (const imageId of car.images) {
                    const hotspots = await ctx.db
                        .query("modHotspots")
                        .withIndex("by_imageId", (q) => q.eq("imageId", imageId))
                        .collect();
                    for (const hotspot of hotspots) {
                        await ctx.db.delete(hotspot._id);
                    }
                }
            }

            // Delete parts for this car
            const parts = await ctx.db
                .query("parts")
                .withIndex("by_car", (q) => q.eq("carId", car._id))
                .collect();
            for (const part of parts) {
                await ctx.db.delete(part._id);
            }

            // Delete the car
            await ctx.db.delete(car._id);
        }

        // 2. Anonymize analytics (preserve for aggregate stats, remove PII)
        const analytics = await ctx.db
            .query("analytics")
            .withIndex("by_user", (q) => q.eq("userId", tokenIdentifier))
            .collect();
        for (const event of analytics) {
            await ctx.db.patch(event._id, {
                userId: "deleted_user",
                metadata: undefined // Remove any metadata that might contain PII
            });
        }

        // 3. Delete the user record
        await ctx.db.delete(user._id);

        return {
            success: true,
            message: "Your account and all associated data have been permanently deleted."
        };
    },
});

/**
 * Export all user data in JSON format.
 * GDPR Article 20 - Right to data portability
 */
export const exportMyData = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return null;
        }

        // Find the user
        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
            .first();

        if (!user) {
            return null;
        }

        const userId = identity.subject;
        const tokenIdentifier = identity.tokenIdentifier;

        // Gather all user's cars
        const cars = await ctx.db
            .query("cars")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();

        // Gather all parts for each car
        const carsWithParts = await Promise.all(
            cars.map(async (car) => {
                const parts = await ctx.db
                    .query("parts")
                    .withIndex("by_car", (q) => q.eq("carId", car._id))
                    .collect();

                return {
                    make: car.make,
                    model: car.model,
                    year: car.year,
                    package: car.package,
                    engine: car.engine,
                    transmission: car.transmission,
                    drivetrain: car.drivetrain,
                    bodyStyle: car.bodyStyle,
                    exteriorColor: car.exteriorColor,
                    interiorColor: car.interiorColor,
                    generation: car.generation,
                    powerHp: car.powerHp,
                    torqueLbFt: car.torqueLbFt,
                    description: car.description,
                    isPublished: car.isPublished,
                    createdAt: car.createdAt,
                    parts: parts.map((part) => ({
                        name: part.name,
                        category: part.category,
                        price: part.price,
                        purchaseUrl: part.purchaseUrl,
                        description: part.description,
                    })),
                };
            })
        );

        // Gather analytics summary (not raw data)
        const analytics = await ctx.db
            .query("analytics")
            .withIndex("by_user", (q) => q.eq("userId", tokenIdentifier))
            .collect();

        const analyticsSummary = {
            totalEvents: analytics.length,
            eventTypes: [...new Set(analytics.map((e) => e.type))],
            firstActivity: analytics.length > 0
                ? new Date(Math.min(...analytics.map((e) => e.createdAt))).toISOString()
                : null,
            lastActivity: analytics.length > 0
                ? new Date(Math.max(...analytics.map((e) => e.createdAt))).toISOString()
                : null,
        };

        return {
            exportDate: new Date().toISOString(),
            exportFormat: "GDPR Article 20 Compliant",
            profile: {
                name: user.name,
                email: user.email,
                username: user.username,
                bio: user.bio,
                pictureUrl: user.pictureUrl,
                socialLinks: {
                    instagram: user.instagram,
                    tiktok: user.tiktok,
                    youtube: user.youtube,
                },
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
            cars: carsWithParts,
            activitySummary: analyticsSummary,
        };
    },
});
