import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { verifyAdmin } from "../admin";
import { ConvexError } from "convex/values";

// Get a car by ID for admin panel with admin verification
export const getCarById = query({
  args: {
    carId: v.id("cars"),
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx);
    const car = await ctx.db.get(args.carId);
    
    if (!car) {
      throw new Error("Car not found");
    }
    
    return car;
  },
});

// Get a part by ID for admin panel with admin verification
export const getPartById = query({
  args: {
    partId: v.id("parts"),
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx);
    const part = await ctx.db.get(args.partId);
    
    if (!part) {
      throw new Error("Part not found");
    }
    
    return part;
  },
});

// Get a user by ID for admin panel with admin verification
export const getUserById = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx);
    const user = await ctx.db.get(args.userId);
    
    if (!user) {
      throw new ConvexError("User not found");
    }
    
    return user;
  },
});
