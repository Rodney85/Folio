import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { verifyAdmin } from "../admin";

// Update a car's details
export const updateCar = mutation({
  args: {
    carId: v.id("cars"),
    year: v.optional(v.string()),
    make: v.optional(v.string()),
    model: v.optional(v.string()),
    trim: v.optional(v.string()),
    description: v.optional(v.string()),
    isPublished: v.optional(v.boolean()),
    isFeatured: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx);
    
    // Get the existing car to ensure it exists
    const existingCar = await ctx.db.get(args.carId);
    if (!existingCar) {
      throw new Error("Car not found");
    }
    
    // Create an update object with only the fields that were provided
    const updateFields: Record<string, any> = {};
    if (args.year !== undefined) updateFields.year = args.year;
    if (args.make !== undefined) updateFields.make = args.make;
    if (args.model !== undefined) updateFields.model = args.model;
    if (args.trim !== undefined) updateFields.trim = args.trim;
    if (args.description !== undefined) updateFields.description = args.description;
    if (args.isPublished !== undefined) updateFields.isPublished = args.isPublished;
    if (args.isFeatured !== undefined) updateFields.isFeatured = args.isFeatured;
    
    // Update the car with the new fields
    await ctx.db.patch(args.carId, updateFields);
    
    // Log the update
    await ctx.db.insert("analytics", {
      type: "car_updated",
      carId: args.carId,
      userId: "system", // Admin action
      updatedFields: Object.keys(updateFields),
      createdAt: Date.now(),
    });
    
    return { success: true };
  },
});

// Update a part's details
export const updatePart = mutation({
  args: {
    partId: v.id("parts"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    condition: v.optional(v.string()),
    isPublished: v.optional(v.boolean()),
    isFeatured: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx);
    
    // Get the existing part to ensure it exists
    const existingPart = await ctx.db.get(args.partId);
    if (!existingPart) {
      throw new Error("Part not found");
    }
    
    // Create an update object with only the fields that were provided
    const updateFields: Record<string, any> = {};
    if (args.name !== undefined) updateFields.name = args.name;
    if (args.description !== undefined) updateFields.description = args.description;
    if (args.category !== undefined) updateFields.category = args.category;
    if (args.condition !== undefined) updateFields.condition = args.condition;
    if (args.isPublished !== undefined) updateFields.isPublished = args.isPublished;
    if (args.isFeatured !== undefined) updateFields.isFeatured = args.isFeatured;
    
    // Update the part with the new fields
    await ctx.db.patch(args.partId, updateFields);
    
    // Log the update
    await ctx.db.insert("analytics", {
      type: "part_updated",
      partId: args.partId,
      userId: "system", // Admin action
      updatedFields: Object.keys(updateFields),
      createdAt: Date.now(),
    });
    
    return { success: true };
  },
});

// Toggle publication status of a car
export const toggleCarPublishStatus = mutation({
  args: {
    carId: v.id("cars"),
    isPublished: v.boolean()
  },
  handler: async (ctx, args) => {
    // Verify admin access
    await verifyAdmin(ctx);
    
    // Get car information
    const car = await ctx.db.get(args.carId);
    if (!car) {
      throw new Error("Car not found");
    }
    
    // Update car publish status
    await ctx.db.patch(args.carId, {
      isPublished: args.isPublished
    });
    
    // Find and update all parts for this car to match the car's publish status
    const parts = await ctx.db
      .query("parts")
      .withIndex("by_car", (q) => q.eq("carId", args.carId))
      .collect();
    
    let updatedPartsCount = 0;
    for (const part of parts) {
      if (part.isPublished !== args.isPublished) {
        await ctx.db.patch(part._id, {
          isPublished: args.isPublished
        });
        updatedPartsCount++;
      }
    }
    
    // Log action in analytics
    await ctx.db.insert("analytics", {
      type: args.isPublished ? "car_published_by_admin" : "car_unpublished_by_admin",
      carId: args.carId,
      userId: "admin",
      createdAt: Date.now(),
      partsAffected: updatedPartsCount
    });
    
    return { 
      success: true,
      message: `Car ${args.isPublished ? 'published' : 'unpublished'} with ${updatedPartsCount} parts updated`
    };
  }
});

// Toggle featured status of a car
export const toggleCarFeatureStatus = mutation({
  args: {
    carId: v.id("cars"),
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx);
    
    const car = await ctx.db.get(args.carId);
    if (!car) {
      throw new Error("Car not found");
    }
    
    // Toggle the isFeatured status (creating it if it doesn't exist)
    const currentStatus = car.isFeatured === true;
    await ctx.db.patch(args.carId, { isFeatured: !currentStatus });
    
    // Log the change
    await ctx.db.insert("analytics", {
      type: !currentStatus ? "car_featured" : "car_unfeatured",
      carId: args.carId,
      userId: "system", // Admin action
      createdAt: Date.now(),
    });
    
    return { success: true, isFeatured: !currentStatus };
  },
});

// Toggle publication status of a part
export const togglePartPublishStatus = mutation({
  args: {
    partId: v.id("parts"),
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx);
    
    const part = await ctx.db.get(args.partId);
    if (!part) {
      throw new Error("Part not found");
    }
    
    // Toggle the isPublished status (creating it if it doesn't exist)
    const currentStatus = part.isPublished === true;
    await ctx.db.patch(args.partId, { isPublished: !currentStatus });
    
    // Log the change
    await ctx.db.insert("analytics", {
      type: !currentStatus ? "part_published" : "part_unpublished",
      partId: args.partId,
      userId: "system", // Admin action
      createdAt: Date.now(),
    });
    
    return { success: true, isPublished: !currentStatus };
  },
});

// Toggle featured status of a part
export const togglePartFeatureStatus = mutation({
  args: {
    partId: v.id("parts"),
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx);
    
    const part = await ctx.db.get(args.partId);
    if (!part) {
      throw new Error("Part not found");
    }
    
    // Toggle the isFeatured status (creating it if it doesn't exist)
    const currentStatus = part.isFeatured === true;
    await ctx.db.patch(args.partId, { isFeatured: !currentStatus });
    
    // Log the change
    await ctx.db.insert("analytics", {
      type: !currentStatus ? "part_featured" : "part_unfeatured",
      partId: args.partId,
      userId: "system", // Admin action
      createdAt: Date.now(),
    });
    
    return { success: true, isFeatured: !currentStatus };
  },
});
