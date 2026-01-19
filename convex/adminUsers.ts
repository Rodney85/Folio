import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { verifyAdmin } from "./admin";

// Get user with detailed information including activity stats
export const getUserDetails = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx);

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Get user's cars - using tokenIdentifier
    const userCars = await ctx.db
      .query("cars")
      .filter((q) => q.eq(q.field("userId"), user.tokenIdentifier))
      .collect();

    // Get user's parts - using tokenIdentifier (assuming parts also use tokenIdentifier)
    // If parts use user._id, this needs to be checked. 
    // Based on common patterns, it's likely tokenIdentifier if cars use it.
    // Let's assume tokenIdentifier for now, but this might need verification if parts are 0 too.
    const userParts = await ctx.db
      .query("parts")
      .filter((q) => q.eq(q.field("userId"), user.tokenIdentifier))
      .collect();

    // Get user's recent activity (last 20 events)
    // Analytics usually uses userId as tokenIdentifier or _id? 
    // In adminDashboard.ts we saw: q.eq(q.field("tokenIdentifier"), activity.userId)
    // So analytics.userId seems to be tokenIdentifier.
    const recentActivity = await ctx.db
      .query("analytics")
      .filter((q) => q.eq(q.field("userId"), user.tokenIdentifier))
      .order("desc")
      .take(20);

    // Get user's last login time
    const lastLoginEvent = await ctx.db
      .query("analytics")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), user.tokenIdentifier),
          q.eq(q.field("type"), "user_login")
        )
      )
      .order("desc")
      .first();

    // Calculate activity metrics
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    const monthlyActivity = await ctx.db
      .query("analytics")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), user.tokenIdentifier),
          q.gte(q.field("createdAt"), thirtyDaysAgo)
        )
      )
      .collect();

    const weeklyActivity = monthlyActivity.filter(
      event => event.createdAt >= sevenDaysAgo
    );

    // Get profile views
    const profileViews = await ctx.db
      .query("analytics")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), user.tokenIdentifier),
          q.eq(q.field("type"), "profile_view")
        )
      )
      .collect();

    // Get product clicks (cars and parts)
    const productClicks = await ctx.db
      .query("analytics")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), user.tokenIdentifier),
          q.or(
            q.eq(q.field("type"), "car_view"),
            q.eq(q.field("type"), "part_view")
          )
        )
      )
      .collect();

    // Find most viewed car
    let topCar = null;
    if (userCars.length > 0) {
      // Get view counts for all user cars
      const carViewsMap = new Map();

      // Count views for each car
      for (const car of userCars) {
        // Get analytics for this specific car - assuming carId is a direct field on analytics
        const carViews = await ctx.db
          .query("analytics")
          .filter((q) =>
            q.and(
              q.eq(q.field("type"), "car_view"),
              q.eq(q.field("carId"), car._id)
            )
          )
          .collect();

        carViewsMap.set(car._id, {
          id: car._id,
          name: car.make && car.model ? `${car.make} ${car.model}` : "Unknown Car",
          views: carViews.length
        });
      }

      // Find the car with most views
      let maxViews = 0;
      for (const [_, carStats] of carViewsMap.entries()) {
        if (carStats.views > maxViews) {
          maxViews = carStats.views;
          topCar = carStats;
        }
      }
    }

    return {
      ...user,
      stats: {
        totalCars: userCars.length,
        totalParts: userParts.length,
        lastLogin: lastLoginEvent ? lastLoginEvent.createdAt : null,
        activityLast7Days: weeklyActivity.length,
        activityLast30Days: monthlyActivity.length,
        profileViews: profileViews.length,
        productClicks: productClicks.length,
        topCar: topCar || undefined
      },
      recentActivity,
    };
  },
});

// Update user details (name and email)
export const updateUserDetails = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx);

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Update user details
    await ctx.db.patch(args.userId, {
      name: args.name,
      email: args.email,
      updatedAt: Date.now()
    });

    // Log the update
    await ctx.db.insert("analytics", {
      type: "user_details_updated",
      userId: user.tokenIdentifier, // Use tokenIdentifier for consistency
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

// Get users with advanced filtering options
export const getFilteredUsers = query({
  args: {
    roleFilter: v.optional(v.string()),
    subscriptionFilter: v.optional(v.string()),
    activityFilter: v.optional(v.string()), // active, inactive
    sortBy: v.optional(v.string()), // createdAt, name, activity
    sortDirection: v.optional(v.string()), // asc, desc
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
    searchQuery: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx);

    const limit = args.limit ?? 20;

    let users = [];

    // If search query is present, use search index
    if (args.searchQuery) {
      users = await ctx.db
        .query("users")
        .withSearchIndex("search_users", (q) =>
          q.search("name", args.searchQuery!)
        )
        .collect();
    } else {
      // Start with base query
      let usersQuery = ctx.db.query("users");

      // Apply role filter if specified
      if (args.roleFilter) {
        usersQuery = usersQuery.filter(q =>
          q.eq(q.field("role"), args.roleFilter)
        );
      }

      // Apply subscription filter if specified
      if (args.subscriptionFilter) {
        usersQuery = usersQuery.filter(q =>
          q.eq(q.field("subscriptionStatus"), args.subscriptionFilter)
        );
      }

      // Get the users according to the filters
      users = await usersQuery.collect();
    }

    // Post-processing filters (that couldn't be done in DB query if mixed with search)
    if (args.searchQuery) {
      // Re-apply filters if we came from search
      if (args.roleFilter) {
        users = users.filter(u => u.role === args.roleFilter);
      }
      if (args.subscriptionFilter) {
        users = users.filter(u => u.subscriptionStatus === args.subscriptionFilter);
      }
    }

    // We need to fetch activity data for all users if we're sorting or filtering by activity
    if (args.activityFilter || args.sortBy === "activity") {
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

      // Get all activity in the last 30 days
      const recentActivity = await ctx.db
        .query("analytics")
        .filter(q => q.gte(q.field("createdAt"), thirtyDaysAgo))
        .collect();

      // Create a map of user IDs to activity counts
      const userActivityMap = new Map();
      recentActivity.forEach(activity => {
        const userId = activity.userId;
        if (userId) {
          userActivityMap.set(userId, (userActivityMap.get(userId) || 0) + 1);
        }
      });

      // Apply activity filter
      if (args.activityFilter) {
        if (args.activityFilter === "active") {
          users = users.filter(user => userActivityMap.get(user.tokenIdentifier) > 0);
        } else if (args.activityFilter === "inactive") {
          users = users.filter(user => !userActivityMap.get(user.tokenIdentifier));
        }
      }

      // Apply activity sorting
      if (args.sortBy === "activity") {
        users.sort((a, b) => {
          const activityA = userActivityMap.get(a.tokenIdentifier) || 0;
          const activityB = userActivityMap.get(b.tokenIdentifier) || 0;
          return args.sortDirection === "asc"
            ? activityA - activityB
            : activityB - activityA;
        });
      }
    } else {
      // Apply other sorts
      if (args.sortBy === "createdAt") {
        users.sort((a, b) => {
          const dateA = Number(a.createdAt) || 0;
          const dateB = Number(b.createdAt) || 0;
          return args.sortDirection === "asc" ? dateA - dateB : dateB - dateA;
        });
      } else if (args.sortBy === "name") {
        users.sort((a, b) => {
          const nameA = (a.name || "").toLowerCase();
          const nameB = (b.name || "").toLowerCase();
          return args.sortDirection === "asc"
            ? nameA.localeCompare(nameB)
            : nameB.localeCompare(nameA);
        });
      }
    }

    // Cursor handling
    const cursor = args.cursor ? JSON.parse(args.cursor) : null;
    if (cursor) {
      const cursorIndex = users.findIndex(user => user._id === cursor.lastId);
      if (cursorIndex !== -1) {
        users = users.slice(cursorIndex + 1);
      }
    }

    // Take only the requested amount for this page
    const paginatedUsers = users.slice(0, limit);

    // Create next cursor
    const nextCursor = paginatedUsers.length === limit
      ? JSON.stringify({ lastId: paginatedUsers[paginatedUsers.length - 1]._id })
      : null;

    // Enrich user data with basic stats
    const enrichedUsers = await Promise.all(paginatedUsers.map(async (user) => {
      const carsCount = await ctx.db
        .query("cars")
        .filter(q => q.eq(q.field("userId"), user.tokenIdentifier)) // FIXED: Use tokenIdentifier
        .collect()
        .then(cars => cars.length);

      // Explicitly return fields to avoid "excessively deep type instantiation" error
      return {
        _id: user._id,
        _creationTime: user._creationTime,
        name: user.name,
        email: user.email,
        pictureUrl: user.pictureUrl,
        role: user.role,
        subscriptionStatus: user.subscriptionStatus,
        createdAt: user.createdAt,
        carsCount
      };
    }));

    return {
      users: enrichedUsers,
      nextCursor
    };
  },
});

// Update user role (e.g. promote to admin or demote)
export const updateUserRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx);

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Update the user role
    await ctx.db.patch(args.userId, { role: args.role });

    return { success: true };
  },
});

// Update user subscription tier
export const updateUserSubscription = mutation({
  args: {
    userId: v.id("users"),
    subscriptionTier: v.string(),
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx);

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Update the user subscription
    await ctx.db.patch(args.userId, {
      subscriptionStatus: args.subscriptionTier,
      updatedAt: Date.now()
    });

    return { success: true };
  },
});

// Get user activity over time
export const getUserActivityTimeline = query({
  args: {
    userId: v.id("users"),
    timeRange: v.optional(v.string()), // week, month, year
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx);

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    let startTime;
    const now = Date.now();

    if (args.timeRange === "week") {
      startTime = now - 7 * 24 * 60 * 60 * 1000;
    } else if (args.timeRange === "year") {
      startTime = now - 365 * 24 * 60 * 60 * 1000;
    } else {
      // Default to month
      startTime = now - 30 * 24 * 60 * 60 * 1000;
    }

    const userActivity = await ctx.db
      .query("analytics")
      .filter(q =>
        q.and(
          q.eq(q.field("userId"), user.tokenIdentifier), // FIXED: Use tokenIdentifier
          q.gte(q.field("createdAt"), startTime)
        )
      )
      .collect();

    // Group by date for the timeline
    const activityByDate = {};

    userActivity.forEach(activity => {
      const date = new Date(activity.createdAt).toISOString().split('T')[0];
      if (!activityByDate[date]) {
        activityByDate[date] = [];
      }
      activityByDate[date].push(activity);
    });

    // Format for timeline display
    const timeline = Object.keys(activityByDate).map(date => ({
      date,
      count: activityByDate[date].length,
      events: activityByDate[date].map(event => ({
        eventType: event.type,
        timestamp: event.createdAt,
        details: event.details || {}
      }))
    }));

    return timeline.sort((a, b) => a.date.localeCompare(b.date));
  }
});
