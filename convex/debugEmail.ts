import { query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
    handler: async (ctx) => {
        let results = [];
        const targetUsername = "carfolio_cc";

        // Check specific username
        const user = await ctx.db
            .query("users")
            .withIndex("by_username", (q) => q.eq("username", targetUsername))
            .first();

        if (user) {
            results.push(`Found Username '${targetUsername}': ${user.name} (${user._id})`);
        } else {
            results.push(`Username '${targetUsername}' NOT found`);
        }

        // Check for ANY admin
        const admins = await ctx.db
            .query("users")
            .filter(q => q.eq(q.field("role"), "admin"))
            .take(5);

        if (admins.length > 0) {
            results.push(`Found ${admins.length} Admins:`);
            admins.forEach(u => results.push(`- ${u.name} (User: ${u.username || "n/a"})`));
        } else {
            results.push("No users with role='admin' found.");
        }

        return results.join("\n");
    },
});
