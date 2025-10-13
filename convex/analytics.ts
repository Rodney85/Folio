import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Log an analytics event
export const logEvent = mutation({
  args: {
    type: v.string(),
    carId: v.optional(v.id("cars")),
    partId: v.optional(v.id("parts")),
    metadata: v.optional(v.any()),
    // Analytics tracking fields
    visitorDevice: v.optional(v.string()),
    referrer: v.optional(v.string()),
    visitorId: v.optional(v.string()),
    // UTM parameters
    utmSource: v.optional(v.string()),
    utmMedium: v.optional(v.string()),
    utmCampaign: v.optional(v.string()),
    // Geographic data
    country: v.optional(v.string()),
    city: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    // Prepare metadata with UTM and geographic data
    const enhancedMetadata = {
      ...args.metadata,
      ...(args.utmSource && { utmSource: args.utmSource }),
      ...(args.utmMedium && { utmMedium: args.utmMedium }),
      ...(args.utmCampaign && { utmCampaign: args.utmCampaign }),
      ...(args.country && { country: args.country }),
      ...(args.city && { city: args.city })
    };

    if (!identity) {
      // For public views, we still want to log but without user ID
      await ctx.db.insert("analytics", {
        userId: "anonymous",
        type: args.type,
        carId: args.carId,
        partId: args.partId,
        metadata: Object.keys(enhancedMetadata).length > 0 ? enhancedMetadata : undefined,
        visitorDevice: args.visitorDevice,
        referrer: args.referrer,
        visitorId: args.visitorId,
        createdAt: Date.now()
      });
      return;
    }

    // Store analytics event in database
    await ctx.db.insert("analytics", {
      userId: identity.subject,
      type: args.type,
      carId: args.carId,
      partId: args.partId,
      metadata: Object.keys(enhancedMetadata).length > 0 ? enhancedMetadata : undefined,
      visitorDevice: args.visitorDevice,
      referrer: args.referrer,
      visitorId: args.visitorId,
      createdAt: Date.now()
    });
  }
});

// Get analytics data (for admin dashboard)
export const getAnalytics = query({
  args: {
    userId: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    eventType: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("analytics");
    
    if (args.userId) {
      query = query.filter(q => q.eq(q.field("userId"), args.userId));
    }
    
    if (args.eventType) {
      query = query.filter(q => q.eq(q.field("type"), args.eventType));
    }
    
    if (args.startDate !== undefined) {
      query = query.filter(q => q.gte(q.field("createdAt"), args.startDate!));
    }
    
    if (args.endDate !== undefined) {
      query = query.filter(q => q.lte(q.field("createdAt"), args.endDate!));
    }
    
    return await query.collect();
  }
});
