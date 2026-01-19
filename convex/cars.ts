import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ConvexError } from "convex/values";
import { Id, Doc } from "./_generated/dataModel";
import { getUser } from "./auth";
import { sanitizeText, sanitizeUrl, sanitizeNumber, MAX_LENGTHS } from "./lib/sanitize";
import { checkRateLimit } from "./lib/rateLimit";

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

      // Rate limit car creation
      checkRateLimit("createCar", user.id);

      // Validate year
      const year = sanitizeNumber(args.year, 1900, new Date().getFullYear() + 2);
      if (year === undefined) {
        throw new ConvexError("Invalid year");
      }

      // Sanitize all text inputs
      const carId = await ctx.db.insert("cars", {
        userId: user.id,
        make: sanitizeText(args.make, MAX_LENGTHS.carField) || args.make,
        model: sanitizeText(args.model, MAX_LENGTHS.carField) || args.model,
        year: year,
        package: sanitizeText(args.package, MAX_LENGTHS.carField),
        engine: sanitizeText(args.engine, MAX_LENGTHS.carField),
        transmission: sanitizeText(args.transmission, MAX_LENGTHS.carField),
        drivetrain: sanitizeText(args.drivetrain, MAX_LENGTHS.carField),
        bodyStyle: sanitizeText(args.bodyStyle, MAX_LENGTHS.carField),
        exteriorColor: sanitizeText(args.exteriorColor, MAX_LENGTHS.carField),
        interiorColor: sanitizeText(args.interiorColor, MAX_LENGTHS.carField),
        generation: sanitizeText(args.generation, MAX_LENGTHS.carField),
        powerHp: sanitizeText(args.powerHp, MAX_LENGTHS.carField),
        torqueLbFt: sanitizeText(args.torqueLbFt, MAX_LENGTHS.carField),
        description: sanitizeText(args.description, MAX_LENGTHS.description),
        images: args.images ?? [],
        isPublished: args.isPublished ?? true,
        createdAt: new Date().toISOString(),
      });

      return { carId };
    } catch (error) {
      if (error instanceof ConvexError) {
        throw error;
      }
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

// Get a specific car by ID with access control
export const getCarById = query({
  args: { carId: v.id("cars") },
  handler: async (ctx, args) => {
    const car = await ctx.db.get(args.carId);

    if (!car) {
      return null; // Return null instead of throwing error
    }

    // If the car is published, anyone can see it
    if (car.isPublished) {
      return car;
    }

    // For unpublished cars, check for ownership or subscription
    const identity = await ctx.auth.getUserIdentity();

    // If there's no authenticated user, they can't see an unpublished car
    if (!identity) {
      return null;
    }

    // The owner can always see their own car
    if (car.userId === identity.subject) {
      return car;
    }

    // If none of the above, deny access
    return null;
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

      // Rate limit car updates
      checkRateLimit("updateCar", user.id);

      const car = await ctx.db.get(args.carId);

      if (!car) {
        throw new ConvexError("Car not found");
      }

      if (car.userId !== user.id) {
        throw new ConvexError("Not authorized to update this car");
      }

      // Sanitize all text inputs
      const updates: Partial<Omit<Doc<"cars">, "_id" | "_creationTime">> = {
        ...(args.make !== undefined && { make: sanitizeText(args.make, MAX_LENGTHS.carField) || args.make }),
        ...(args.model !== undefined && { model: sanitizeText(args.model, MAX_LENGTHS.carField) || args.model }),
        ...(args.year !== undefined && { year: sanitizeNumber(args.year, 1900, new Date().getFullYear() + 2) }),
        ...(args.package !== undefined && { package: sanitizeText(args.package, MAX_LENGTHS.carField) }),
        ...(args.engine !== undefined && { engine: sanitizeText(args.engine, MAX_LENGTHS.carField) }),
        ...(args.transmission !== undefined && { transmission: sanitizeText(args.transmission, MAX_LENGTHS.carField) }),
        ...(args.drivetrain !== undefined && { drivetrain: sanitizeText(args.drivetrain, MAX_LENGTHS.carField) }),
        ...(args.bodyStyle !== undefined && { bodyStyle: sanitizeText(args.bodyStyle, MAX_LENGTHS.carField) }),
        ...(args.exteriorColor !== undefined && { exteriorColor: sanitizeText(args.exteriorColor, MAX_LENGTHS.carField) }),
        ...(args.interiorColor !== undefined && { interiorColor: sanitizeText(args.interiorColor, MAX_LENGTHS.carField) }),
        ...(args.generation !== undefined && { generation: sanitizeText(args.generation, MAX_LENGTHS.carField) }),
        ...(args.powerHp !== undefined && { powerHp: sanitizeText(args.powerHp, MAX_LENGTHS.carField) }),
        ...(args.torqueLbFt !== undefined && { torqueLbFt: sanitizeText(args.torqueLbFt, MAX_LENGTHS.carField) }),
        ...(args.description !== undefined && { description: sanitizeText(args.description, MAX_LENGTHS.description) }),
        ...(args.images !== undefined && { images: args.images }),
        ...(args.isPublished !== undefined && { isPublished: args.isPublished }),
        updatedAt: new Date().toISOString(),
      };

      await ctx.db.patch(args.carId, updates);

      return { success: true };
    } catch (error) {
      if (error instanceof ConvexError) {
        throw error;
      }
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

      // Rate limit car deletion
      checkRateLimit("deleteCar", user.id);

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
      if (error instanceof ConvexError) {
        throw error;
      }
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
