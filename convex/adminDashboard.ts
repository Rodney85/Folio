import { query } from "./_generated/server";
import { v } from "convex/values";
import { verifyAdmin } from "./admin";

// Get total cars count for admin dashboard
export const getTotalCars = query({
  args: {},
  handler: async (ctx) => {
    await verifyAdmin(ctx);
    const cars = await ctx.db.query("cars").collect();
    return cars.length;
  },
});

// Get total parts count for admin dashboard
export const getTotalParts = query({
  args: {},
  handler: async (ctx) => {
    await verifyAdmin(ctx);
    const parts = await ctx.db.query("parts").collect();
    return parts.length;
  },
});

// Get new content added in the last 7 days
export const getNewContentCount = query({
  args: {},
  handler: async (ctx) => {
    await verifyAdmin(ctx);
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    // Convert to string for string comparison or keep as number for number comparison
    const sevenDaysAgoStr = sevenDaysAgo.toString();

    // Get new cars in last 7 days - handle string or number format
    const newCars = await ctx.db
      .query("cars")
      .collect()
      .then(cars => cars.filter(car => {
        if (!car.createdAt) return false;

        // Handle either string or number timestamp
        if (typeof car.createdAt === 'string') {
          return car.createdAt > sevenDaysAgoStr;
        } else {
          return car.createdAt > sevenDaysAgo;
        }
      }));

    // Get new parts in last 7 days
    const newParts = await ctx.db
      .query("parts")
      .collect()
      .then(parts => parts.filter(part => {
        return part._creationTime > sevenDaysAgo;
      }));

    return { cars: newCars.length, parts: newParts.length };
  },
});

// Get recent activities for activity feed
export const getRecentActivities = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx);
    const limit = args.limit || 10;

    // Get most recent analytics events
    const activities = await ctx.db
      .query("analytics")
      .order("desc")
      .take(limit);

    // Enrich activities with user, car, part info
    const enrichedActivities = await Promise.all(activities.map(async (activity) => {
      let userData: { name: string; email?: string } = { name: "Unknown User" };
      let itemData = { type: 'unknown', title: 'Unknown Item' };

      // Fetch user info if userId exists
      if (activity.userId) {
        const user = await ctx.db
          .query("users")
          .filter(q => q.eq(q.field("tokenIdentifier"), activity.userId))
          .first();
        if (user) {
          userData = { name: user.name, email: user.email };
        }
      }

      // Fetch car info if carId exists
      if (activity.carId) {
        const car = await ctx.db.get(activity.carId);
        if (car) {
          itemData = {
            type: 'car',
            title: `${car.year} ${car.make} ${car.model}`,
          };
        }
      }

      // Fetch part info if partId exists
      if (activity.partId) {
        const part = await ctx.db.get(activity.partId);
        if (part) {
          itemData = {
            type: 'part',
            title: part.name,
          };
        }
      }

      return {
        id: activity._id,
        type: activity.type,
        timestamp: activity.createdAt,
        user: userData,
        item: itemData,
      };
    }));

    return enrichedActivities;
  },
});

// Get subscription metrics - counts users by subscription plan
export const getSubscriptionMetrics = query({
  args: {},
  handler: async (ctx) => {
    await verifyAdmin(ctx);

    const users = await ctx.db.query("users").collect();

    const metrics = {
      free: 0,
      starter: 0,
      pro: 0,
      total: users.length,
    };

    users.forEach(user => {
      const plan = user.subscriptionStatus || 'free';
      if (plan === 'starter') metrics.starter++;
      else if (plan === 'pro') metrics.pro++;
      else metrics.free++;
    });

    return metrics;
  },
});

// Get daily new users for the past 30 days for charts
export const getUserGrowthData = query({
  args: {},
  handler: async (ctx) => {
    await verifyAdmin(ctx);
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    // Get all users created in the past 30 days
    const users = await ctx.db
      .query("users")
      .collect()
      .then(users => users.filter(user => {
        if (!user.createdAt) return false;

        const createdAt = typeof user.createdAt === 'string'
          ? parseInt(user.createdAt)
          : user.createdAt;

        return createdAt > thirtyDaysAgo;
      }));

    // Group users by day
    const dailyCounts = {};
    const today = new Date();

    // Initialize all 30 days with 0 counts
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dailyCounts[dateStr] = 0;
    }

    // Count users per day
    users.forEach(user => {
      const createdAt = typeof user.createdAt === 'string'
        ? parseInt(user.createdAt)
        : user.createdAt;

      const date = new Date(createdAt);
      const dateStr = date.toISOString().split('T')[0];

      if (dailyCounts[dateStr] !== undefined) {
        dailyCounts[dateStr]++;
      }
    });

    // Convert to array format for charts
    return Object.entries(dailyCounts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  },
});

// Get quick stats for the admin dashboard
export const getQuickStats = query({
  args: {},
  handler: async (ctx) => {
    await verifyAdmin(ctx);

    // Get total counts
    const users = await ctx.db.query("users").collect();
    const cars = await ctx.db.query("cars").collect();
    const parts = await ctx.db.query("parts").collect();

    // Calculate active users (had an analytics event in last 7 days)
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentEvents = await ctx.db
      .query("analytics")
      .filter(q => q.gt(q.field("createdAt"), sevenDaysAgo))
      .collect();

    const activeUserIds = new Set(recentEvents.map(event => event.userId));

    return {
      totalUsers: users.length,
      totalCars: cars.length,
      totalParts: parts.length,
      activeUsers: activeUserIds.size,
      conversionRate: users.length > 0 ? Math.round((activeUserIds.size / users.length) * 100) : 0,
    };
  },
});

// FINANCIAL METRICS (MRR/ARR)
export const getFinancialMetrics = query({
  args: {},
  handler: async (ctx) => {
    await verifyAdmin(ctx);

    // Define pricing constants (assumed values, should be config driven)
    const PRICING = {
      starter: 9.99,
      pro: 29.99
    };

    const users = await ctx.db.query("users").collect();

    let currentMRR = 0;

    users.forEach(user => {
      if (user.subscriptionStatus === 'starter') currentMRR += PRICING.starter;
      if (user.subscriptionStatus === 'pro') currentMRR += PRICING.pro;
    });

    const currentARR = currentMRR * 12;

    // Generate mock historical data for the chart (since we don't have historical sub data yet)
    // In a real app, you'd query a 'subscriptions' or 'invoices' table with timestamps
    const history = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setMonth(today.getMonth() - i);
      const monthStr = date.toLocaleString('default', { month: 'short' });

      // Mock growth curve
      const growthFactor = 1 - (i * 0.1); // 0.4 to 1.0
      history.push({
        month: monthStr,
        mrr: Math.round(currentMRR * growthFactor),
        arr: Math.round(currentARR * growthFactor)
      });
    }

    return {
      currentMRR,
      currentARR,
      history
    };
  }
});

// CHURN METRICS
export const getChurnMetrics = query({
  args: {},
  handler: async (ctx) => {
    await verifyAdmin(ctx);

    // In a real app, we'd look at 'subscription_cancelled' events
    // For now, we'll simulate churn based on inactive users who were previously active

    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const sixtyDaysAgo = Date.now() - 60 * 24 * 60 * 60 * 1000;

    // Users active 30-60 days ago
    const previouslyActiveEvents = await ctx.db
      .query("analytics")
      .filter(q =>
        q.and(
          q.gte(q.field("createdAt"), sixtyDaysAgo),
          q.lt(q.field("createdAt"), thirtyDaysAgo)
        )
      )
      .collect();

    const previouslyActiveUserIds = new Set(previouslyActiveEvents.map(e => e.userId));

    // Users active in last 30 days
    const currentlyActiveEvents = await ctx.db
      .query("analytics")
      .filter(q => q.gte(q.field("createdAt"), thirtyDaysAgo))
      .collect();

    const currentlyActiveUserIds = new Set(currentlyActiveEvents.map(e => e.userId));

    // Churned = Previously Active AND NOT Currently Active
    let churnedCount = 0;
    previouslyActiveUserIds.forEach(userId => {
      if (!currentlyActiveUserIds.has(userId)) {
        churnedCount++;
      }
    });

    const totalPrevious = previouslyActiveUserIds.size || 1; // Avoid div by 0
    const churnRate = (churnedCount / totalPrevious) * 100;

    return {
      churnRate: Math.round(churnRate * 10) / 10, // 1 decimal place
      churnedUsers: churnedCount,
      totalActive: currentlyActiveUserIds.size
    };
  }
});

// USAGE METRICS (Heatmap/Top Features)
export const getUsageMetrics = query({
  args: {},
  handler: async (ctx) => {
    await verifyAdmin(ctx);

    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    const events = await ctx.db
      .query("analytics")
      .filter(q => q.gte(q.field("createdAt"), thirtyDaysAgo))
      .collect();

    const usageMap = new Map();

    events.forEach(event => {
      const type = event.type;
      usageMap.set(type, (usageMap.get(type) || 0) + 1);
    });

    // Format for chart
    const usageData = Array.from(usageMap.entries())
      .map(([feature, count]) => ({
        feature: feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), // Format "car_view" -> "Car View"
        count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 features

    return usageData;
  }
});
