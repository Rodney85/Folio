import { query } from "./_generated/server";

export const find = query({
    handler: async (ctx) => {
        const username = "carfolio_cc";
        const user = await ctx.db
            .query("users")
            .withIndex("by_username", (q) => q.eq("username", username))
            .first();

        if (user) {
            return `FOUND: ${user.name} (${user._id})`;
        } else {
            // Try to find ANY admin to suggest an alternative
            const admin = await ctx.db
                .query("users")
                // .filter(q => q.eq(q.field("role"), "admin")) // Role might be undefined
                .take(1);

            if (admin.length > 0) {
                return `NOT FOUND 'carfolio_cc'. Alternative User: ${admin[0].name} (${admin[0].username})`;
            }
            return "NOT FOUND 'carfolio_cc'. No other users found to suggest.";
        }
    },
});
