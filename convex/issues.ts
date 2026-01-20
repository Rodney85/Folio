import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * User-facing issue functions
 */

// Submit a new issue
export const submitIssue = mutation({
    args: {
        type: v.string(),
        title: v.string(),
        description: v.string(),
        priority: v.optional(v.string()),
        pageUrl: v.optional(v.string()),
        deviceInfo: v.optional(v.string()),
        screenshotId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Must be logged in to submit an issue");
        }

        const now = Date.now();

        const issueId = await ctx.db.insert("issues", {
            userId: identity.subject,
            userEmail: identity.email || "",
            userName: identity.name || identity.email || "Unknown",
            type: args.type,
            title: args.title,
            description: args.description,
            priority: args.priority || "medium",
            pageUrl: args.pageUrl,
            deviceInfo: args.deviceInfo,
            screenshotId: args.screenshotId,
            status: "open",
            createdAt: now,
            updatedAt: now,
        });

        return { issueId, success: true };
    },
});

// Get issues submitted by the current user
export const getUserIssues = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return [];
        }

        const issues = await ctx.db
            .query("issues")
            .withIndex("by_user", (q) => q.eq("userId", identity.subject))
            .order("desc")
            .collect();

        return issues;
    },
});

// Get a single issue by ID (only if user owns it)
export const getIssueById = query({
    args: { issueId: v.id("issues") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return null;
        }

        const issue = await ctx.db.get(args.issueId);
        if (!issue || issue.userId !== identity.subject) {
            return null;
        }

        return issue;
    },
});
