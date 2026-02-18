import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { verifyAdmin } from "./admin";

// Get all system settings
export const getSettings = query({
    args: {},
    handler: async (ctx) => {
        // Only admins should see system settings
        await verifyAdmin(ctx);

        const settings = await ctx.db.query("system_settings").collect();

        // Convert to a key-value object for easier frontend consumption
        const settingsMap: Record<string, any> = {};

        // Set defaults
        settingsMap.siteName = "Carfolio";
        settingsMap.supportEmail = "support@carfolio.com";
        settingsMap.maintenanceMode = false;
        settingsMap.allowRegistrations = true;
        settingsMap.requireEmailVerification = true;

        // Override with DB values
        settings.forEach(setting => {
            settingsMap[setting.key] = setting.value;
        });

        return settingsMap;
    },
});

// Update a single system setting
export const updateSetting = mutation({
    args: {
        key: v.string(),
        value: v.any(),
    },
    handler: async (ctx, args) => {
        await verifyAdmin(ctx);

        const existingSetting = await ctx.db
            .query("system_settings")
            .withIndex("by_key", (q) => q.eq("key", args.key))
            .first();

        if (existingSetting) {
            await ctx.db.patch(existingSetting._id, { value: args.value });
        } else {
            await ctx.db.insert("system_settings", { key: args.key, value: args.value });
        }

        return { success: true };
    },
});
