import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ConvexError } from "convex/values";
import { Id, Doc } from "./_generated/dataModel";
import { getUser } from "./auth";

// Create a new car with image URLs
export const createCar = mutation({
  args: {
    make: v.string(),
    model: v.string(),
    year: v.number(),
    package: v.optional(v.string()),
    engine: v.optional(v.string()),
    transmission: v.optional(v.string()),
    drivetrain: v.optional(v.string()),
    bodyStyle: v.optional(v.string()),
    exteriorColor: v.optional(v.string()),
    interiorColor: v.optional(v.string()),
    generation: v.optional(v.string()),
    powerHp: v.optional(v.string()),
    torqueLbFt: v.optional(v.string()),
    description: v.optional(v.string()),
    images: v.optional(v.array(v.string())),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    try {
      const user = await getUser(ctx);
      
      const carId = await ctx.db.insert("cars", {
        userId: user.id,
        make: args.make,
        model: args.model,
        year: args.year,
        package: args.package,
        engine: args.engine,
        transmission: args.transmission,
        drivetrain: args.drivetrain,
        bodyStyle: args.bodyStyle,
        exteriorColor: args.exteriorColor,
        interiorColor: args.interiorColor,
        generation: args.generation,
        powerHp: args.powerHp,
        torqueLbFt: args.torqueLbFt,
        description: args.description,
        images: args.images ?? [],
        isPublished: args.isPublished ?? true,
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
    make: v.optional(v.string()),
    model: v.optional(v.string()),
    year: v.optional(v.number()),
    package: v.optional(v.string()),
    engine: v.optional(v.string()),
    transmission: v.optional(v.string()),
    drivetrain: v.optional(v.string()),
    bodyStyle: v.optional(v.string()),
    exteriorColor: v.optional(v.string()),
    interiorColor: v.optional(v.string()),
    generation: v.optional(v.string()),
    powerHp: v.optional(v.string()),
    torqueLbFt: v.optional(v.string()),
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

      const { carId, ...rest } = args;
      const updates: Partial<Omit<Doc<"cars">, "_id" | "_creationTime">> = { ...rest };
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
  args: { carId: v.id("cars") },
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

// Publish all user cars - makes all cars visible on public profile
export const publishAllCars = mutation({
  args: {},
  handler: async (ctx) => {
    try {
      const user = await getUser(ctx);
      
      // Get all user's cars
      const cars = await ctx.db
        .query("cars")
        .withIndex("by_user", (q) => q.eq("userId", user.id))
        .collect();
      
      console.log(`Found ${cars.length} cars for user ${user.id}`);
      
      // Force update all cars to ensure they're published
      // This addresses potential data inconsistencies
      for (const car of cars) {
        // Force update every car to ensure isPublished is true
        await ctx.db.patch(car._id, {
          isPublished: true
        });
      }
      
      return { 
        success: true,
        message: `Force-published all ${cars.length} cars. They should now be visible on your public profile.`
      };
    } catch (error) {
      console.error("Error publishing cars:", error);
      throw new ConvexError("Not authorized");
    }
  },
});
