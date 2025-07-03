import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ConvexError } from "convex/values";
import { Id } from "./_generated/dataModel";
import { getUser } from "./auth";

// Create a new car with image URLs
export const createCar = mutation({
  args: {
    brand: v.string(),
    model: v.string(),
    year: v.number(),
    power: v.string(),
    description: v.optional(v.string()),
    images: v.optional(v.array(v.string())),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Get current user ID
    try {
      const user = await getUser(ctx);
      
      // Create car record
      const carId = await ctx.db.insert("cars", {
        userId: user.id,
        make: args.brand,
        model: args.model,
        year: args.year,
        description: args.description ?? "",
        images: args.images ?? [],
        isPublished: args.isPublished ?? true,
        power: args.power,
        createdAt: new Date().toISOString(),
      });

      return { carId };
    } catch (error) {
      throw new ConvexError("Not authorized");
    }
  },
});

// Get all cars for the current user
export const getUserCars = query({
  handler: async (ctx) => {
    try {
      const user = await getUser(ctx);
      
      const cars = await ctx.db
        .query("cars")
        .withIndex("by_user", (q) => q.eq("userId", user.id))
        .order("desc")
        .collect();

      return cars;
    } catch (error) {
      return [];
    }
  },
});

// Get the user's first car (oldest by creation date)
export const getUserFirstCar = query({
  handler: async (ctx) => {
    try {
      const user = await getUser(ctx);
      
      const cars = await ctx.db
        .query("cars")
        .withIndex("by_user", (q) => q.eq("userId", user.id))
        .order("asc")
        .take(1);

      return cars[0] || null;
    } catch (error) {
      return null;
    }
  },
});

// Get a specific car by ID
export const getCarById = query({
  args: { carId: v.id("cars") },
  handler: async (ctx, args) => {
    const car = await ctx.db.get(args.carId);
    
    if (!car) {
      throw new ConvexError("Car not found");
    }
    
    return car;
  },
});

// Update a car's details
export const updateCar = mutation({
  args: {
    carId: v.id("cars"),
    brand: v.optional(v.string()),
    model: v.optional(v.string()),
    year: v.optional(v.number()),
    power: v.optional(v.string()),
    description: v.optional(v.string()),
    images: v.optional(v.array(v.string())),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    try {
      const user = await getUser(ctx);
      
      const car = await ctx.db.get(args.carId);
      
      if (!car) {
        throw new ConvexError("Car not found");
      }
      
      if (car.userId !== user.id) {
        throw new ConvexError("Not authorized to update this car");
      }

      // Update only the fields that are provided
      const updates: any = {};
      if (args.brand !== undefined) updates.make = args.brand;
      if (args.model !== undefined) updates.model = args.model;
      if (args.year !== undefined) updates.year = args.year;
      if (args.power !== undefined) updates.power = args.power;
      if (args.description !== undefined) updates.description = args.description;
      if (args.images !== undefined) updates.images = args.images;
      if (args.isPublished !== undefined) updates.isPublished = args.isPublished;
      updates.updatedAt = new Date().toISOString();

      await ctx.db.patch(args.carId, updates);
      
      return { success: true };
    } catch (error) {
      throw new ConvexError("Not authorized");
    }
  },
});

// Delete a car
export const deleteCar = mutation({
  args: {
    carId: v.id("cars"),
  },
  handler: async (ctx, args) => {
    try {
      const user = await getUser(ctx);
      
      const car = await ctx.db.get(args.carId);
      
      if (!car) {
        throw new ConvexError("Car not found");
      }
      
      if (car.userId !== user.id) {
        throw new ConvexError("Not authorized to delete this car");
      }

      // Delete the car record
      await ctx.db.delete(args.carId);
      
      return { success: true };
    } catch (error) {
      throw new ConvexError("Not authorized");
    }
  },
});
