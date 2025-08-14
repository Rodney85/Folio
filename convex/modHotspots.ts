import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ConvexError } from "convex/values";
import { getUser } from "./auth";

// Create a new mod hotspot on an image
export const create = mutation({
  args: {
    carId: v.id("cars"),
    partId: v.id("parts"),
    imageId: v.string(),
    x: v.number(),
    y: v.number(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      const user = await getUser(ctx);

      // Verify the car exists and belongs to the user
      const car = await ctx.db.get(args.carId);
      if (!car || car.userId !== user.id) {
        throw new ConvexError("Car not found or you don't have permission.");
      }

      // Verify the part exists and belongs to the car
      const part = await ctx.db.get(args.partId);
      if (!part || part.carId !== args.carId) {
        throw new ConvexError("Part not found or does not belong to this car.");
      }

      const hotspotId = await ctx.db.insert("modHotspots", {
        carId: args.carId,
        partId: args.partId,
        imageId: args.imageId,
        x: args.x,
        y: args.y,
        description: args.description,
      });

      return { hotspotId };
    } catch (error: any) {
      throw new ConvexError(`Failed to create hotspot: ${error.message}`);
    }
  },
});

// Get all hotspots for a specific image
export const getByImageId = query({
  args: { imageId: v.string() },
  handler: async (ctx, args) => {
    const hotspots = await ctx.db
      .query("modHotspots")
      .withIndex("by_imageId", (q) => q.eq("imageId", args.imageId))
      .collect();
    return hotspots;
  },
});
