import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { SubscriptionPlan, hasSubscriptionAccess } from "./subscriptions";

// Mutation to log an analytics event
export const logEvent = mutation({
  args: {
    type: v.string(),
    carId: v.optional(v.id("cars")),
    partId: v.optional(v.id("parts")),
    visitorId: v.optional(v.string()),
    visitorDevice: v.optional(v.string()),
    referrer: v.optional(v.string()),
    utmSource: v.optional(v.string()),
    utmMedium: v.optional(v.string()),
    utmCampaign: v.optional(v.string()),
    country: v.optional(v.string()),
    city: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Get the target user ID based on event type and target
    let targetUserId: string;
    if (args.carId) {
      const car = await ctx.db.get(args.carId);
      if (!car) throw new Error("Car not found");
      targetUserId = car.userId;
    } else if (args.partId) {
      const part = await ctx.db.get(args.partId);
      if (!part) throw new Error("Part not found");
      targetUserId = part.userId;
    } else {
      // For profile views, the target is the viewed user
      const user = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("tokenIdentifier"), identity.tokenIdentifier))
        .first();
      if (!user) throw new Error("User not found");
      targetUserId = user._id;
    }

    // Log the event
    return ctx.db.insert("analytics", {
      userId: targetUserId,
      type: args.type,
      carId: args.carId,
      partId: args.partId,
      visitorId: args.visitorId,
      visitorDevice: args.visitorDevice,
      referrer: args.referrer,
      utmSource: args.utmSource,
      utmMedium: args.utmMedium,
      utmCampaign: args.utmCampaign,
      country: args.country,
      city: args.city,
      createdAt: Date.now(),
    });
  },
});

// Query to get analytics summary for a user
export const getAnalyticsSummary = query({
  args: {
    userId: v.string(),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    // Optional parameters for specific date ranges
    last7Days: v.optional(v.boolean()),
    last14Days: v.optional(v.boolean()),
    last30Days: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Get the requesting user's ID and subscription info
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("tokenIdentifier"), identity.tokenIdentifier))
      .first();
    if (!user) throw new Error("User not found");
    
    // No need to verify ownership - we use the authenticated user's ID directly
    // The frontend should always pass the Convex user ID, not the Clerk ID
    const userId = args.userId;
    
    // Verify the user ID matches the authenticated user
    if (userId !== user._id.toString()) {
      throw new Error("Unauthorized - User ID mismatch");
    }
    
    // Determine user's subscription level
    let subscriptionPlan = user.subscriptionPlan || SubscriptionPlan.FREE;
    const now = Date.now();
    
    // Check if subscription is expired
    if (user.subscriptionEndDate && user.subscriptionEndDate < now) {
      // If subscription has expired, treat as FREE plan
      subscriptionPlan = SubscriptionPlan.FREE;
    }

    // Build date filter
    let startDate, endDate;
    
    if (args.last7Days) {
      startDate = now - 7 * 24 * 60 * 60 * 1000;
      endDate = now;
    } else if (args.last14Days) {
      startDate = now - 14 * 24 * 60 * 60 * 1000;
      endDate = now;
    } else if (args.last30Days) {
      startDate = now - 30 * 24 * 60 * 60 * 1000;
      endDate = now;
    } else {
      startDate = args.startDate ?? now - 30 * 24 * 60 * 60 * 1000; // Default to last 30 days
      endDate = args.endDate ?? now;
    }

    // Query analytics events
    const events = await ctx.db
      .query("analytics")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .filter((q) => q.gte(q.field("createdAt"), startDate))
      .filter((q) => q.lte(q.field("createdAt"), endDate))
      .collect();

    // Calculate summary metrics based on subscription level
    // Base summary available to all (including FREE users)
    const summary = {
      totalProfileViews: 0,
      totalCarViews: 0,
      totalProductClicks: 0,
      uniqueVisitors: new Set(),
      viewsByDevice: {
        mobile: 0,
        desktop: 0,
        tablet: 0,
      },
      // For per-car metrics (STARTER+)
      carViews: {} as Record<string, number>,
      productClicks: {} as Record<string, number>,
      topProducts: [] as Array<{partId: string, clicks: number}>,
      // For timeline data (STARTER+ for simple, PRO for detailed)
      dailyViews: {} as Record<string, number>,
      // For PRO features
      referrers: {} as Record<string, number>,
      geoBreakdown: {} as Record<string, number>,
      // Meta information
      lastActivityTimestamp: 0,
    };

    events.forEach((event) => {
      // Track last activity (all plans)
      if (event.createdAt > summary.lastActivityTimestamp) {
        summary.lastActivityTimestamp = event.createdAt;
      }

      // Unique visitors (all plans)
      if (event.visitorId) {
        summary.uniqueVisitors.add(event.visitorId);
      }
      
      // Device breakdown (PRO plan, but we collect for all)
      if (event.visitorDevice) {
        summary.viewsByDevice[event.visitorDevice as keyof typeof summary.viewsByDevice]++;
      }

      // Referrer tracking (PRO plan, but we collect for all)
      if (event.referrer && hasSubscriptionAccess(subscriptionPlan, SubscriptionPlan.PRO)) {
        summary.referrers[event.referrer] = (summary.referrers[event.referrer] || 0) + 1;
      }

      // Geo breakdown (PRO plan, but we collect for all)
      if (event.country && hasSubscriptionAccess(subscriptionPlan, SubscriptionPlan.PRO)) {
        summary.geoBreakdown[event.country] = (summary.geoBreakdown[event.country] || 0) + 1;
      }
      
      // Daily views for trend analysis (basic for STARTER, detailed for PRO)
      const date = new Date(event.createdAt).toISOString().split('T')[0]; // YYYY-MM-DD
      if (hasSubscriptionAccess(subscriptionPlan, SubscriptionPlan.STARTER)) {
        summary.dailyViews[date] = (summary.dailyViews[date] || 0) + 1;
      }
      
      // Process by event type
      switch (event.type) {
        case "profile_view":
          summary.totalProfileViews++;
          break;
          
        case "car_view":
          summary.totalCarViews++;
          // Per-car metrics (STARTER+)
          if (event.carId && hasSubscriptionAccess(subscriptionPlan, SubscriptionPlan.STARTER)) {
            const carIdStr = event.carId.toString();
            summary.carViews[carIdStr] = (summary.carViews[carIdStr] || 0) + 1;
          }
          break;
          
        case "product_click":
          summary.totalProductClicks++;
          // Per-product metrics (STARTER+)
          if (event.partId && hasSubscriptionAccess(subscriptionPlan, SubscriptionPlan.STARTER)) {
            const partIdStr = event.partId.toString();
            summary.productClicks[partIdStr] = (summary.productClicks[partIdStr] || 0) + 1;
          }
          break;
      }
    });
    
    // Process top products for STARTER+ plan
    if (hasSubscriptionAccess(subscriptionPlan, SubscriptionPlan.STARTER)) {
      summary.topProducts = Object.entries(summary.productClicks)
        .map(([partId, clicks]) => ({ partId, clicks }))
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 3); // Top 3 products
    }
    
    // Return different data based on subscription plan
    const baseData = {
      totalProfileViews: summary.totalProfileViews,
      totalCarViews: summary.totalCarViews,
      totalProductClicks: summary.totalProductClicks,
      uniqueVisitors: summary.uniqueVisitors.size,
      lastActivityTimestamp: summary.lastActivityTimestamp > 0 ? summary.lastActivityTimestamp : null,
      periodStart: startDate,
      periodEnd: endDate,
      subscriptionPlan: subscriptionPlan,
    };
    
    // STARTER plan features
    if (hasSubscriptionAccess(subscriptionPlan, SubscriptionPlan.STARTER)) {
      return {
        ...baseData,
        carViews: summary.carViews,
        productClicks: summary.productClicks,
        topProducts: summary.topProducts,
        dailyViews: summary.dailyViews,
        // PRO plan features
        ...(hasSubscriptionAccess(subscriptionPlan, SubscriptionPlan.PRO) ? {
          viewsByDevice: summary.viewsByDevice,
          referrers: summary.referrers,
          geoBreakdown: summary.geoBreakdown,
        } : {}),
      };
    }
    
    // FREE plan (basic data only)
    return baseData;
  },
});
