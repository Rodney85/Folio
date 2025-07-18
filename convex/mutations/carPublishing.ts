import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { getUser } from "../auth";

/**
 * Update the publish status of a car and all its associated parts
 * This ensures that parts are always published/unpublished together with their car
 */
export const updateCarPublishStatus = mutation({
  args: {
    carId: v.id("cars"),
    isPublished: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Verify user has permission to update this car
    const user = await getUser(ctx);
    const car = await ctx.db.get(args.carId);
    
    if (!car) {
      throw new Error("Car not found");
    }
    
    if (car.userId !== user.id) {
      // Check if user is an admin - admins can publish anyone's car
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        throw new Error("Authentication required");
      }
      
      const userRecord = await ctx.db
        .query("users")
        .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
        .first();
        
      if (userRecord?.role !== "admin") {
        throw new Error("You don't have permission to update this car");
      }
    }
    
    // Update the car publish status
    await ctx.db.patch(args.carId, {
      isPublished: args.isPublished,
      updatedAt: new Date().toISOString(),
    });
    
    // Find all parts for this car and update their publish status too
    const parts = await ctx.db
      .query("parts")
      .withIndex("by_car", (q) => q.eq("carId", args.carId))
      .collect();
    
    for (const part of parts) {
      await ctx.db.patch(part._id, {
        isPublished: args.isPublished
      });
    }
    
    // Log analytics event
    await ctx.db.insert("analytics", {
      type: args.isPublished ? "car_published" : "car_unpublished",
      carId: args.carId,
      userId: user.id,
      createdAt: Date.now(),
      partsAffected: parts.length, // Using 'partsAffected' to match our schema
      updatedCount: parts.length, // Also add updatedCount for schema consistency
    });
    
    return { 
      success: true, 
      message: `Car ${args.isPublished ? 'published' : 'unpublished'} with ${parts.length} associated parts`,
      partsUpdated: parts.length
    };
  },
});
