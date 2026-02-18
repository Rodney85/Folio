import { internalMutation, internalAction, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// ------------------------------------------------------------------
// 1. "The Influencer" (Weekly Growth Stats)
// ------------------------------------------------------------------
export const sendWeeklyInfluencerStats = internalMutation({
    args: {},
    handler: async (ctx) => {
        const now = Date.now();
        const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

        // Iterate all users (MVP: limit to 50 active users or just first 50 for now to be safe on limits)
        // In production, use pagination or a cursor.
        const users = await ctx.db.query("users").take(50);

        for (const user of users) {
            if (!user.email) continue;

            // Count views in the last week
            // We can't do complex agg easily, so we fetch metadata
            // Optimization: Use `by_user` and filter
            const views = await ctx.db
                .query("analytics")
                .withIndex("by_user", (q) => q.eq("userId", user._id))
                .filter((q) => q.gte(q.field("createdAt"), oneWeekAgo))
                .collect();

            const viewCount = views.length;

            if (viewCount > 0) {
                // @ts-ignore
                await ctx.scheduler.runAfter(0, internal.notifications.triggerNotification, {
                    userId: user.tokenIdentifier,
                    email: user.email,
                    type: "influencer_stats",
                    data: {
                        message: viewCount.toString(),
                        firstName: user.name?.split(" ")[0] || "Influencer",
                        actionUrl: `${process.env.CONVEX_SITE_URL}/dashboard/analytics`
                    },
                });
            }
        }
    },
});

// ------------------------------------------------------------------
// 2. "The Shop Manager" (Weekly Revenue Nudge)
// ------------------------------------------------------------------
export const sendWeeklyShopManagerNudge = internalMutation({
    args: {},
    handler: async (ctx) => {
        // Get users (limit for safety)
        const users = await ctx.db.query("users").take(50);

        for (const user of users) {
            if (!user.email) continue;

            // Get user's cars
            const cars = await ctx.db
                .query("cars")
                .withIndex("by_user", (q) => q.eq("userId", user._id))
                .collect();

            let totalMissingLinks = 0;

            for (const car of cars) {
                const parts = await ctx.db
                    .query("parts")
                    .withIndex("by_car", (q) => q.eq("carId", car._id))
                    .collect();

                totalMissingLinks += parts.filter(p => !p.purchaseUrl || p.purchaseUrl.trim() === "").length;
            }

            if (totalMissingLinks >= 3) {
                const carModel = cars.length > 0 ? `${cars[0].make} ${cars[0].model}` : "your build";

                // @ts-ignore
                await ctx.scheduler.runAfter(0, internal.notifications.triggerNotification, {
                    userId: user.tokenIdentifier,
                    email: user.email,
                    type: "shop_manager",
                    data: {
                        subject: totalMissingLinks.toString(),
                        message: carModel,
                        firstName: user.name?.split(" ")[0] || "Builder",
                        actionUrl: `${process.env.CONVEX_SITE_URL}/dashboard/cars`
                    },
                });
            }
        }
    },
});

// ------------------------------------------------------------------
// 3. "The Accountant" (Monthly Build Value)
// ------------------------------------------------------------------
export const sendMonthlyBuildValue = internalMutation({
    args: {},
    handler: async (ctx) => {
        const users = await ctx.db.query("users").take(50);

        for (const user of users) {
            if (!user.email) continue;

            const cars = await ctx.db
                .query("cars")
                .withIndex("by_user", (q) => q.eq("userId", user._id))
                .collect();

            let totalValue = 0;
            for (const car of cars) {
                const parts = await ctx.db
                    .query("parts")
                    .withIndex("by_car", (q) => q.eq("carId", car._id))
                    .collect();

                for (const part of parts) {
                    if (part.price && !isNaN(parseFloat(part.price.toString()))) {
                        totalValue += parseFloat(part.price.toString());
                    }
                }
            }

            if (totalValue > 0) {
                const carModel = cars.length > 0 ? `${cars[0].make} ${cars[0].model}` : "Garage";

                // @ts-ignore
                await ctx.scheduler.runAfter(0, internal.notifications.triggerNotification, {
                    userId: user.tokenIdentifier,
                    email: user.email,
                    type: "build_value",
                    data: {
                        subject: totalValue.toFixed(0),
                        message: carModel,
                        firstName: user.name?.split(" ")[0] || "Investor",
                        actionUrl: `${process.env.CONVEX_SITE_URL}/dashboard/cars`
                    },
                });
            }
        }
    },
});

// ------------------------------------------------------------------
// 4. "The Visionary" (Monthly Hotspot Nudge)
// ------------------------------------------------------------------
export const sendMonthlyVisionaryNudge = internalMutation({
    args: {},
    handler: async (ctx) => {
        const users = await ctx.db.query("users").take(50);

        for (const user of users) {
            if (!user.email) continue;

            const cars = await ctx.db
                .query("cars")
                .withIndex("by_user", (q) => q.eq("userId", user._id))
                .collect();

            let hasImages = false;
            let carModel = "your build";

            for (const car of cars) {
                if (car.images && car.images.length > 0) {
                    hasImages = true;
                    carModel = `${car.make} ${car.model}`;
                    break;
                }
            }

            if (hasImages) {
                let totalHotspots = 0;
                for (const car of cars) {
                    const hotspots = await ctx.db
                        .query("modHotspots")
                        .withIndex("by_car_and_image", q => q.eq("carId", car._id))
                        .collect();
                    totalHotspots += hotspots.length;
                }

                if (totalHotspots === 0) {
                    // @ts-ignore
                    await ctx.scheduler.runAfter(0, internal.notifications.triggerNotification, {
                        userId: user.tokenIdentifier,
                        email: user.email,
                        type: "visionary",
                        data: {
                            message: carModel,
                            firstName: user.name?.split(" ")[0] || "Visionary",
                            actionUrl: `${process.env.CONVEX_SITE_URL}/dashboard/cars`
                        },
                    });
                }
            }
        }
    }
});
