import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { verifyAdmin } from "./admin";

// Get cars with pagination and search
export const getAdminCars = query({
    args: {
        limit: v.optional(v.number()),
        cursor: v.optional(v.string()),
        searchQuery: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await verifyAdmin(ctx);
        const limit = args.limit ?? 20;

        let cars = await ctx.db.query("cars").order("desc").collect();

        // Client-side filtering for now since we don't have a search index on cars yet
        // In a real app with many cars, we should add a search index
        if (args.searchQuery) {
            const query = args.searchQuery.toLowerCase();
            cars = cars.filter(car =>
                car.make.toLowerCase().includes(query) ||
                car.model.toLowerCase().includes(query) ||
                car.year.toString().includes(query)
            );
        }

        // Cursor pagination
        const cursor = args.cursor ? JSON.parse(args.cursor) : null;
        if (cursor) {
            const cursorIndex = cars.findIndex(c => c._id === cursor.lastId);
            if (cursorIndex !== -1) {
                cars = cars.slice(cursorIndex + 1);
            }
        }

        const paginatedCars = cars.slice(0, limit);
        const nextCursor = paginatedCars.length === limit
            ? JSON.stringify({ lastId: paginatedCars[paginatedCars.length - 1]._id })
            : null;

        // Enrich with owner info
        const enrichedCars = await Promise.all(paginatedCars.map(async (car) => {
            const user = await ctx.db
                .query("users")
                .filter(q => q.eq(q.field("tokenIdentifier"), car.userId))
                .first();

            return {
                ...car,
                ownerName: user?.name || "Unknown",
                ownerEmail: user?.email || "Unknown"
            };
        }));

        return {
            cars: enrichedCars,
            nextCursor
        };
    },
});

// Get parts with pagination and search
export const getAdminParts = query({
    args: {
        limit: v.optional(v.number()),
        cursor: v.optional(v.string()),
        searchQuery: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await verifyAdmin(ctx);
        const limit = args.limit ?? 20;

        let parts = await ctx.db.query("parts").order("desc").collect();

        if (args.searchQuery) {
            const query = args.searchQuery.toLowerCase();
            parts = parts.filter(part =>
                part.name.toLowerCase().includes(query) ||
                part.category.toLowerCase().includes(query)
            );
        }

        const cursor = args.cursor ? JSON.parse(args.cursor) : null;
        if (cursor) {
            const cursorIndex = parts.findIndex(p => p._id === cursor.lastId);
            if (cursorIndex !== -1) {
                parts = parts.slice(cursorIndex + 1);
            }
        }

        const paginatedParts = parts.slice(0, limit);
        const nextCursor = paginatedParts.length === limit
            ? JSON.stringify({ lastId: paginatedParts[paginatedParts.length - 1]._id })
            : null;

        // Enrich with car info
        const enrichedParts = await Promise.all(paginatedParts.map(async (part) => {
            const car = await ctx.db.get(part.carId);
            return {
                ...part,
                carName: car ? `${car.year} ${car.make} ${car.model}` : "Unknown Car"
            };
        }));

        return {
            parts: enrichedParts,
            nextCursor
        };
    },
});

// Delete a car (admin only)
export const deleteCar = mutation({
    args: { carId: v.id("cars") },
    handler: async (ctx, args) => {
        await verifyAdmin(ctx);
        await ctx.db.delete(args.carId);

        // Also delete associated parts and analytics? 
        // For now, let's keep it simple, but in production we should cascade delete
    },
});

// Delete a part (admin only)
export const deletePart = mutation({
    args: { partId: v.id("parts") },
    handler: async (ctx, args) => {
        await verifyAdmin(ctx);
        await ctx.db.delete(args.partId);
    },
});
