import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { verifyAdmin } from "./admin";

/**
 * Admin-only issue management functions
 */

// Get all issues with optional filters
export const getAllIssues = query({
    args: {
        status: v.optional(v.string()),
        type: v.optional(v.string()),
        priority: v.optional(v.string()),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        await verifyAdmin(ctx);

        const limit = args.limit || 50;

        // Use separate queries based on filter to avoid type issues
        if (args.status) {
            return await ctx.db
                .query("issues")
                .withIndex("by_status", (q) => q.eq("status", args.status!))
                .order("desc")
                .take(limit);
        }

        // Default: order by created date
        return await ctx.db
            .query("issues")
            .withIndex("by_created_at")
            .order("desc")
            .take(limit);
    },
});

// Get issue statistics for dashboard
export const getIssueStats = query({
    args: {},
    handler: async (ctx) => {
        await verifyAdmin(ctx);

        const allIssues = await ctx.db.query("issues").collect();

        const stats = {
            total: allIssues.length,
            open: allIssues.filter((i) => i.status === "open").length,
            inProgress: allIssues.filter((i) => i.status === "in_progress").length,
            resolved: allIssues.filter((i) => i.status === "resolved").length,
            closed: allIssues.filter((i) => i.status === "closed").length,
            // By type
            bugs: allIssues.filter((i) => i.type === "bug").length,
            features: allIssues.filter((i) => i.type === "feature").length,
            // By priority
            critical: allIssues.filter((i) => i.priority === "critical").length,
            high: allIssues.filter((i) => i.priority === "high").length,
        };

        return stats;
    },
});

// Get a single issue by ID (admin view - includes all details)
export const getIssueDetails = query({
    args: { issueId: v.id("issues") },
    handler: async (ctx, args) => {
        await verifyAdmin(ctx);
        return await ctx.db.get(args.issueId);
    },
});

// Update issue status
export const updateIssueStatus = mutation({
    args: {
        issueId: v.id("issues"),
        status: v.string(),
    },
    handler: async (ctx, args) => {
        await verifyAdmin(ctx);

        const now = Date.now();
        const updates: Record<string, unknown> = {
            status: args.status,
            updatedAt: now,
        };

        // Set resolvedAt if status is resolved or closed
        if (args.status === "resolved" || args.status === "closed") {
            updates.resolvedAt = now;
        }

        await ctx.db.patch(args.issueId, updates);
        return { success: true };
    },
});

// Assign issue to admin
export const assignIssue = mutation({
    args: {
        issueId: v.id("issues"),
        adminId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await verifyAdmin(ctx);

        const identity = await ctx.auth.getUserIdentity();
        const assignedTo = args.adminId || identity?.subject;

        await ctx.db.patch(args.issueId, {
            assignedTo,
            updatedAt: Date.now(),
        });

        return { success: true };
    },
});

// Add admin notes to issue
export const addAdminNotes = mutation({
    args: {
        issueId: v.id("issues"),
        notes: v.string(),
    },
    handler: async (ctx, args) => {
        await verifyAdmin(ctx);

        await ctx.db.patch(args.issueId, {
            adminNotes: args.notes,
            updatedAt: Date.now(),
        });

        return { success: true };
    },
});

// Resolve issue with resolution summary
export const resolveIssue = mutation({
    args: {
        issueId: v.id("issues"),
        resolution: v.string(),
    },
    handler: async (ctx, args) => {
        await verifyAdmin(ctx);

        const now = Date.now();
        await ctx.db.patch(args.issueId, {
            status: "resolved",
            resolution: args.resolution,
            resolvedAt: now,
            updatedAt: now,
        });

        return { success: true };
    },
});

// Update issue priority
export const updateIssuePriority = mutation({
    args: {
        issueId: v.id("issues"),
        priority: v.string(),
    },
    handler: async (ctx, args) => {
        await verifyAdmin(ctx);

        await ctx.db.patch(args.issueId, {
            priority: args.priority,
            updatedAt: Date.now(),
        });

        return { success: true };
    },
});

// Delete an issue
export const deleteIssue = mutation({
    args: { issueId: v.id("issues") },
    handler: async (ctx, args) => {
        await verifyAdmin(ctx);
        await ctx.db.delete(args.issueId);
        return { success: true };
    },
});
