import { mutation } from "../_generated/server";
import { v } from "convex/values";

// Admin verification helper
const verifyAdmin = async (ctx: any) => {
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

// Delete a user by ID
export const deleteUser = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx);
    
    // Delete the user
    await ctx.db.delete(args.userId);
    
    // Log the deletion
    await ctx.db.insert("analytics", {
      type: "user_deleted",
      userId: "system",  // Using 'system' to indicate this was done by an admin
      createdAt: Date.now(),
    });
    
    return { success: true };
  },
});

// Delete a car by ID
export const deleteCar = mutation({
  args: {
    carId: v.id("cars"),
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx);
    
    // Delete the car
    await ctx.db.delete(args.carId);
    
    // Log the deletion
    await ctx.db.insert("analytics", {
      type: "car_deleted",
      carId: args.carId,
      userId: "system",  // Using 'system' to indicate this was done by an admin
      createdAt: Date.now(),
    });
    
    return { success: true };
  },
});

// Delete a part by ID
export const deletePart = mutation({
  args: {
    partId: v.id("parts"),
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx);
    
    // Delete the part
    await ctx.db.delete(args.partId);
    
    // Log the deletion
    await ctx.db.insert("analytics", {
      type: "part_deleted",
      partId: args.partId,
      userId: "system",  // Using 'system' to indicate this was done by an admin
      createdAt: Date.now(),
    });
    
    return { success: true };
  },
});
