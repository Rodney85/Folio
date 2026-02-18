import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const byEmail = mutation({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();

        if (!user) {
            console.log(`User with email ${args.email} not found`);
            return { success: false, message: "User not found" };
        }

        await ctx.db.patch(user._id, { role: "admin" });
        console.log(`User ${args.email} promoted to admin`);
        return { success: true, message: `User ${args.email} is now an admin` };
    },
});
