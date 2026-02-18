import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Verify if the current user has admin role
export const verifyAdmin = async (ctx: any) => {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error("You must be logged in to access this data.");
  }

  // First check if the user has the 'admin' role from Clerk's publicMetadata
  if (identity.publicMetadata?.role === 'admin') {
    return; // User is admin based on Clerk metadata
  }

  // If not in Clerk metadata, check if the role is stored in the Convex database
  const user = await ctx.db
    .query("users")
    .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
    .first();

  // Allow access if user has admin role in Convex database
  if (user?.role === 'admin') {
    return; // User is admin based on database record
  }

  // If we get here, user is not an admin in either location
  throw new Error("You must be an admin to access this data.");
};

// Get total number of users for admin dashboard
export const getTotalUsers = query({
  args: {},
  handler: async (ctx) => {
    await verifyAdmin(ctx);
    const users = await ctx.db.query("users").collect();
    return users.length;
  },
});

// Get number of new users in the last 24 hours for admin dashboard
export const getNewUsersCount = query({
  args: {},
  handler: async (ctx) => {
    await verifyAdmin(ctx);
    const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;

    const newUsers = await ctx.db
      .query("users")
      .withIndex("by_created_date", (q) => q.gt("createdAt", twentyFourHoursAgo))
      .collect();

    return newUsers.length;
  },
});

// Get Monthly Active Users (MAU) - users who have activity in the last 30 days
export const getMonthlyActiveUsers = query({
  args: {},
  handler: async (ctx) => {
    await verifyAdmin(ctx);
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    // Get unique user IDs from analytics events in the last 30 days
    const activeUserEvents = await ctx.db
      .query("analytics")
      .filter((q) => q.gt(q.field("createdAt"), thirtyDaysAgo))
      .collect();

    // Get unique user IDs
    const uniqueUserIds = new Set(activeUserEvents.map(event => event.userId));

    return uniqueUserIds.size;
  },
});

// Get Daily Active Users (DAU) - users who have activity in the last 24 hours
export const getDailyActiveUsers = query({
  args: {},
  handler: async (ctx) => {
    await verifyAdmin(ctx);
    const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;

    // Get unique user IDs from analytics events in the last 24 hours
    const activeUserEvents = await ctx.db
      .query("analytics")
      .filter((q) => q.gt(q.field("createdAt"), twentyFourHoursAgo))
      .collect();

    // Get unique user IDs
    const uniqueUserIds = new Set(activeUserEvents.map(event => event.userId));

    return uniqueUserIds.size;
  },
});

// Get all users for admin panel
export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    await verifyAdmin(ctx);
    const users = await ctx.db.query("users").collect();
    return users;
  },
});

// Get all cars for admin panel
export const getAllCars = query({
  args: {},
  handler: async (ctx) => {
    await verifyAdmin(ctx);
    const cars = await ctx.db.query("cars").collect();

    // Fetch owner information for each car
    const carsWithOwners = await Promise.all(
      cars.map(async (car) => {
        // Use query to find user by ID safely
        let owner = null;
        if (car.userId) {
          try {
            owner = await ctx.db
              .query("users")
              .filter((q) => q.eq(q.field("_id"), car.userId))
              .first();
          } catch (error) {
            // If there's an error finding the owner, we'll use the default "Unknown" owner
            console.error(`Error finding owner for car ${car._id}:`, error);
          }
        }

        return {
          ...car,
          owner: owner ? {
            name: owner.name || "Unknown",
            email: owner.email || "",
            username: owner.username || owner.name || "Unknown",
          } : {
            name: "Unknown",
            email: "",
            username: "Unknown"
          },
        };
      })
    );

    return carsWithOwners;
  },
});

// Get all parts for admin panel
export const getAllParts = query({
  args: {},
  handler: async (ctx) => {
    await verifyAdmin(ctx);
    const parts = await ctx.db.query("parts").collect();

    // Fetch owner information for each part
    const partsWithOwners = await Promise.all(
      parts.map(async (part) => {
        // Use query to find user by ID safely
        let owner = null;
        if (part.userId) {
          try {
            owner = await ctx.db
              .query("users")
              .filter((q) => q.eq(q.field("_id"), part.userId))
              .first();
          } catch (error) {
            // If there's an error finding the owner, we'll use the default "Unknown" owner
            console.error(`Error finding owner for part ${part._id}:`, error);
          }
        }

        return {
          ...part,
          owner: owner ? {
            name: owner.name || "Unknown",
            email: owner.email || "",
            username: owner.username || owner.name || "Unknown",
          } : {
            name: "Unknown",
            email: "",
            username: "Unknown"
          },
        };
      })
    );

    return partsWithOwners;
  },
});

// Get analytics data for admin panel
export const getAnalyticsData = query({
  args: {
    timeRange: v.optional(v.string()), // 'day', 'week', 'month', 'year'
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx);

    let startTime = 0;
    const now = Date.now();

    if (args.timeRange === 'day') {
      startTime = now - 24 * 60 * 60 * 1000; // Last 24 hours
    } else if (args.timeRange === 'week') {
      startTime = now - 7 * 24 * 60 * 60 * 1000; // Last 7 days
    } else if (args.timeRange === 'month') {
      startTime = now - 30 * 24 * 60 * 60 * 1000; // Last 30 days
    } else if (args.timeRange === 'year') {
      startTime = now - 365 * 24 * 60 * 60 * 1000; // Last 365 days
    }

    const query = startTime > 0
      ? ctx.db.query("analytics").filter(q => q.gte(q.field("createdAt"), startTime))
      : ctx.db.query("analytics");

    const analytics = await query.collect();
    return analytics;
  },
});

// Get sent emails for admin panel
export const getSentEmails = query({
  args: {},
  handler: async (ctx) => {
    await verifyAdmin(ctx);
    const emails = await ctx.db.query("sent_emails").order("desc").collect();
    return emails;
  },
});
