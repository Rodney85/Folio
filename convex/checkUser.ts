import { query } from "./_generated/server";
import { v } from "convex/values";

export const checkUsername = query({
    args: { username: v.optional(v.string()) },
    handler: async (ctx, args) => {
        let results = [];

        // Check specific username
        if (args.username) {
            const user = await ctx.db
                .query("users")
                .withIndex("by_username", (q) => q.eq("username", args.username))
                .first();
            if (user) results.push(`Found Username '${args.username}': ${user.name} (${user._id})`);
            else results.push(`Username '${args.username}' NOT found`);
        }

        // Check for ANY admin
        const admins = await ctx.db
            .query("users")
            .filter(q => q.eq(q.field("role"), "admin"))
            .take(5);

        if (admins.length > 0) {
            results.push(`Found ${admins.length} Admins:`);
            admins.forEach(u => results.push(`- ${u.name} (${u.username || "no username"})`));
        } else {
            results.push("No users with role='admin' found.");
        }

        return results.join("\n");
    },
});
