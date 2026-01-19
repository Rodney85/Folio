import { query } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";

/**
 * Explore feed recommendation algorithm.
 * Instagram-inspired algorithm that ranks cars based on:
 * - Recency (30%): Newer cars score higher
 * - Popularity (40%): Based on view counts from analytics
 * - Trending (20%): Cars with recent engagement spikes
 * - Diversity (10%): Mix of different car makes
 */

// Types for explore results
interface ExploreCarResult {
    car: Doc<"cars">;
    owner: {
        _id: Id<"users">;
        username?: string;
        pictureUrl?: string;
        name: string;
    };
    score: number;
    isTrending: boolean;
}

/**
 * Get the main explore feed with recommended cars.
 * Only shows cars from premium/admin users.
 */
export const getExploreFeed = query({
    args: {
        limit: v.optional(v.number()),
        cursor: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const limit = args.limit ?? 20;

        // Get all published cars
        const allCars = await ctx.db
            .query("cars")
            .filter((q) => q.eq(q.field("isPublished"), true))
            .collect();

        // Get all users to filter by premium/admin role
        const allUsers = await ctx.db.query("users").collect();
        const userMap = new Map(allUsers.map(u => [u.tokenIdentifier, u]));

        // Also create a map by the user ID format used in cars
        const userByIdMap = new Map<string, Doc<"users">>();
        for (const user of allUsers) {
            // Map by tokenIdentifier parts
            userByIdMap.set(user.tokenIdentifier, user);
            const parts = user.tokenIdentifier.split("|");
            if (parts[1]) {
                userByIdMap.set(parts[1], user);
            }
        }

        // Filter cars to only show those from premium/admin users
        const premiumCars = allCars.filter((car) => {
            const user = userByIdMap.get(car.userId);
            return user && (user.role === "premium" || user.role === "admin");
        });

        // Get analytics data for popularity scoring
        const analytics = await ctx.db.query("analytics").collect();

        // Calculate view counts per car
        const viewCounts = new Map<string, number>();
        const recentViewCounts = new Map<string, number>(); // Last 7 days
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

        for (const event of analytics) {
            if (event.type === "car_view" && event.carId) {
                const carId = event.carId.toString();
                viewCounts.set(carId, (viewCounts.get(carId) ?? 0) + 1);

                if (event.createdAt > sevenDaysAgo) {
                    recentViewCounts.set(carId, (recentViewCounts.get(carId) ?? 0) + 1);
                }
            }
        }

        // Find max views for normalization
        const maxViews = Math.max(...Array.from(viewCounts.values()), 1);
        const maxRecentViews = Math.max(...Array.from(recentViewCounts.values()), 1);

        // Score and rank cars
        const now = Date.now();
        const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

        // Track makes for diversity scoring
        const seenMakes = new Set<string>();

        const scoredCars: ExploreCarResult[] = premiumCars.map((car) => {
            const carIdStr = car._id.toString();
            const totalViews = viewCounts.get(carIdStr) ?? 0;
            const recentViews = recentViewCounts.get(carIdStr) ?? 0;

            // Recency score (0-1): exponential decay over 30 days
            const carCreatedAt = car.createdAt
                ? new Date(car.createdAt).getTime()
                : car._creationTime;
            const daysSinceCreated = (now - carCreatedAt) / (24 * 60 * 60 * 1000);
            const recencyScore = Math.exp(-daysSinceCreated / 30);

            // Popularity score (0-1): log scale of views
            const popularityScore = totalViews > 0
                ? Math.log(1 + totalViews) / Math.log(1 + maxViews)
                : 0;

            // Trending score (0-1): Recent views ratio with recency boost
            const trendingScore = totalViews > 0
                ? (recentViews / totalViews) * recencyScore * (recentViews / maxRecentViews)
                : 0;

            // Diversity bonus (1.0 or 1.5): Boost if we haven't seen this make recently
            const diversityBonus = seenMakes.has(car.make.toLowerCase()) ? 1.0 : 1.5;
            seenMakes.add(car.make.toLowerCase());

            // Final score with weights
            const score =
                (recencyScore * 0.3) +
                (popularityScore * 0.4) +
                (trendingScore * 0.2) +
                ((diversityBonus - 1) * 0.1);

            // Determine if trending (high recent engagement)
            const isTrending = recentViews >= 5 && trendingScore > 0.3;

            // Get owner info
            const owner = userByIdMap.get(car.userId);

            return {
                car,
                owner: {
                    _id: owner?._id ?? ("" as Id<"users">),
                    username: owner?.username,
                    pictureUrl: owner?.pictureUrl,
                    name: owner?.name ?? "Unknown",
                },
                score,
                isTrending,
            };
        });

        // Sort by score descending
        scoredCars.sort((a, b) => b.score - a.score);

        // Apply cursor-based pagination
        let startIndex = 0;
        if (args.cursor) {
            const cursorIndex = scoredCars.findIndex(
                (item) => item.car._id.toString() === args.cursor
            );
            if (cursorIndex !== -1) {
                startIndex = cursorIndex + 1;
            }
        }

        const results = scoredCars.slice(startIndex, startIndex + limit);
        const nextCursor = results.length === limit
            ? results[results.length - 1]?.car._id.toString()
            : null;

        return {
            cars: results,
            nextCursor,
            hasMore: startIndex + limit < scoredCars.length,
        };
    },
});

/**
 * Search explore feed by car make, model, or owner username.
 */
export const searchExplore = query({
    args: {
        query: v.string(),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const searchQuery = args.query.toLowerCase().trim();
        const limit = args.limit ?? 20;

        if (!searchQuery) {
            return { cars: [], hasMore: false };
        }

        // Get all published cars
        const allCars = await ctx.db
            .query("cars")
            .filter((q) => q.eq(q.field("isPublished"), true))
            .collect();

        // Get all users
        const allUsers = await ctx.db.query("users").collect();
        const userByIdMap = new Map<string, Doc<"users">>();
        for (const user of allUsers) {
            userByIdMap.set(user.tokenIdentifier, user);
            const parts = user.tokenIdentifier.split("|");
            if (parts[1]) {
                userByIdMap.set(parts[1], user);
            }
        }

        // Filter cars: premium users only AND matching search
        const matchingCars = allCars.filter((car) => {
            const user = userByIdMap.get(car.userId);
            if (!user || (user.role !== "premium" && user.role !== "admin")) {
                return false;
            }

            // Search in make, model, year, and owner username
            const makeMatch = car.make.toLowerCase().includes(searchQuery);
            const modelMatch = car.model.toLowerCase().includes(searchQuery);
            const yearMatch = car.year.toString().includes(searchQuery);
            const usernameMatch = user.username?.toLowerCase().includes(searchQuery) ?? false;

            return makeMatch || modelMatch || yearMatch || usernameMatch;
        });

        // Format results
        const results = matchingCars.slice(0, limit).map((car) => {
            const owner = userByIdMap.get(car.userId);
            return {
                car,
                owner: {
                    _id: owner?._id ?? ("" as Id<"users">),
                    username: owner?.username,
                    pictureUrl: owner?.pictureUrl,
                    name: owner?.name ?? "Unknown",
                },
            };
        });

        return {
            cars: results,
            hasMore: matchingCars.length > limit,
        };
    },
});

/**
 * Get explore feed filtered by specific criteria (brand, hp, year).
 */
export const getFilteredExploreFeed = query({
    args: {
        make: v.optional(v.string()),
        minYear: v.optional(v.number()),
        maxYear: v.optional(v.number()),
        minHp: v.optional(v.number()),
        maxHp: v.optional(v.number()),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const limit = args.limit ?? 20;

        // Get all published cars
        const allCars = await ctx.db
            .query("cars")
            .filter((q) => q.eq(q.field("isPublished"), true))
            .collect();

        // Get all users
        const allUsers = await ctx.db.query("users").collect();
        const userByIdMap = new Map<string, Doc<"users">>();
        for (const user of allUsers) {
            userByIdMap.set(user.tokenIdentifier, user);
            const parts = user.tokenIdentifier.split("|");
            if (parts[1]) {
                userByIdMap.set(parts[1], user);
            }
        }

        // Filter cars
        const filteredCars = allCars.filter((car) => {
            const user = userByIdMap.get(car.userId);
            // Verify premium user status
            if (!user || (user.role !== "premium" && user.role !== "admin")) {
                return false;
            }

            // Filter by Make
            if (args.make && args.make !== "all") {
                if (car.make.toLowerCase() !== args.make.toLowerCase()) {
                    return false;
                }
            }

            // Filter by Year
            if (args.minYear && car.year < args.minYear) return false;
            if (args.maxYear && car.year > args.maxYear) return false;

            // Filter by Horsepower (parse string "326 hp" -> number)
            if (args.minHp || args.maxHp) {
                const hpStr = car.powerHp || "";
                // Extract number from string like "326" or "326 hp"
                const hpMatch = hpStr.match(/\d+/);
                const hp = hpMatch ? parseInt(hpMatch[0], 10) : 0;

                if (args.minHp && hp < args.minHp) return false;
                if (args.maxHp && hp > args.maxHp) return false;
            }

            return true;
        });

        // Format results
        const results = filteredCars.slice(0, limit).map((car) => {
            const owner = userByIdMap.get(car.userId);
            return {
                car,
                owner: {
                    _id: owner?._id ?? ("" as Id<"users">),
                    username: owner?.username,
                    pictureUrl: owner?.pictureUrl,
                    name: owner?.name ?? "Unknown",
                },
            };
        });

        return {
            cars: results,
            hasMore: filteredCars.length > limit,
        };
    },
});

/**
 * Get trending cars (most viewed in last 7 days).
 */
export const getTrendingCars = query({
    args: {
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const limit = args.limit ?? 10;
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

        // Get recent analytics
        const recentAnalytics = await ctx.db
            .query("analytics")
            .filter((q) =>
                q.and(
                    q.eq(q.field("type"), "car_view"),
                    q.gte(q.field("createdAt"), sevenDaysAgo)
                )
            )
            .collect();

        // Count views per car
        const viewCounts = new Map<string, number>();
        for (const event of recentAnalytics) {
            if (event.carId) {
                const carId = event.carId.toString();
                viewCounts.set(carId, (viewCounts.get(carId) ?? 0) + 1);
            }
        }

        // Sort by view count
        const sortedCarIds = Array.from(viewCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit * 2) // Get extra to filter by premium
            .map(([id]) => id);

        // Get cars and users
        const allUsers = await ctx.db.query("users").collect();
        const userByIdMap = new Map<string, Doc<"users">>();
        for (const user of allUsers) {
            userByIdMap.set(user.tokenIdentifier, user);
            const parts = user.tokenIdentifier.split("|");
            if (parts[1]) {
                userByIdMap.set(parts[1], user);
            }
        }

        // Fetch cars and filter by premium
        const trendingCars: Array<{
            car: Doc<"cars">;
            owner: { _id: Id<"users">; username?: string; pictureUrl?: string; name: string };
            viewCount: number;
        }> = [];

        for (const carIdStr of sortedCarIds) {
            if (trendingCars.length >= limit) break;

            try {
                const car = await ctx.db.get(carIdStr as Id<"cars">);
                if (!car || !car.isPublished) continue;

                const owner = userByIdMap.get(car.userId);
                if (!owner || (owner.role !== "premium" && owner.role !== "admin")) continue;

                trendingCars.push({
                    car,
                    owner: {
                        _id: owner._id,
                        username: owner.username,
                        pictureUrl: owner.pictureUrl,
                        name: owner.name,
                    },
                    viewCount: viewCounts.get(carIdStr) ?? 0,
                });
            } catch {
                // Invalid car ID, skip
                continue;
            }
        }

        return { cars: trendingCars };
    },
});

/**
 * Get popular car makes for filter suggestions.
 */
export const getPopularMakes = query({
    handler: async (ctx) => {
        const allCars = await ctx.db.query("cars").collect();

        // Count makes
        const makeCounts = new Map<string, number>();
        for (const car of allCars) {
            const make = car.make.toLowerCase();
            makeCounts.set(make, (makeCounts.get(make) ?? 0) + 1);
        }

        // Sort by count and return top 10
        const sortedMakes = Array.from(makeCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([make, count]) => ({
                make: make.charAt(0).toUpperCase() + make.slice(1),
                count,
            }));

        return sortedMakes;
    },
});
