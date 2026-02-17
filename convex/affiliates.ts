import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";

/**
 * Submit an affiliate application (public — no auth required).
 */
export const submitApplication = mutation({
    args: {
        name: v.string(),
        email: v.string(),
        socialHandle: v.optional(v.string()),
        platform: v.optional(v.string()),
        audienceSize: v.optional(v.string()),
        message: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Check for duplicate email
        const existing = await ctx.db
            .query("affiliateApplications")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();

        if (existing) {
            throw new ConvexError("An application with this email already exists.");
        }

        await ctx.db.insert("affiliateApplications", {
            name: args.name,
            email: args.email,
            socialHandle: args.socialHandle,
            platform: args.platform,
            audienceSize: args.audienceSize,
            message: args.message,
            status: "pending",
            createdAt: Date.now(),
        });

        return { success: true };
    },
});

/**
 * Get all affiliate applications (admin only).
 */
export const getAllApplications = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new ConvexError("Not authenticated");

        // Check admin status
        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
            .first();

        const isAdmin =
            user?.role === "admin" ||
            (user as any)?.publicMetadata?.role === "admin";

        if (!isAdmin) throw new ConvexError("Not authorized");

        const applications = await ctx.db
            .query("affiliateApplications")
            .order("desc")
            .collect();

        return applications;
    },
});

/**
 * Update affiliate application status (admin only).
 */
export const updateApplicationStatus = mutation({
    args: {
        applicationId: v.id("affiliateApplications"),
        status: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new ConvexError("Not authenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
            .first();

        const isAdmin =
            user?.role === "admin" ||
            (user as any)?.publicMetadata?.role === "admin";

        if (!isAdmin) throw new ConvexError("Not authorized");

        await ctx.db.patch(args.applicationId, { status: args.status });
        return { success: true };
    },
});

/**
 * Get application count by status (admin dashboard widget).
 */
export const getApplicationStats = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return { total: 0, pending: 0, approved: 0, rejected: 0 };

        const all = await ctx.db.query("affiliateApplications").collect();

        return {
            total: all.length,
            pending: all.filter((a) => a.status === "pending").length,
            approved: all.filter((a) => a.status === "approved").length,
            rejected: all.filter((a) => a.status === "rejected").length,
        };
    },
});
