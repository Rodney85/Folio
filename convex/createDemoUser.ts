import { mutation } from "./_generated/server";

export const create = mutation({
    handler: async (ctx) => {
        const username = "carfolio_cc";

        // Check if exists
        const existing = await ctx.db
            .query("users")
            .withIndex("by_username", (q) => q.eq("username", username))
            .first();

        if (existing) {
            return `User '${username}' already exists (${existing._id}).`;
        }

        // Create new
        const userId = await ctx.db.insert("users", {
            name: "CarFolio Demo",
            email: "demo@carfolio.cc",
            username: username,
            tokenIdentifier: "demo_user_token", // Placeholder
            pictureUrl: "https://github.com/shadcn.png",
            bio: "Official Demo Account showing off the platform capabilities.",
            role: "admin",
            profileCompleted: true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });

        return `Created Demo User '${username}' (${userId}).`;
    },
});
