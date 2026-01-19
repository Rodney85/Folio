import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ConvexError } from "convex/values";
import { Id } from "./_generated/dataModel";
import { getUser } from "./auth";
import { sanitizeText, sanitizeUrl, sanitizeNumber, MAX_LENGTHS } from "./lib/sanitize";
import { checkRateLimit } from "./lib/rateLimit";

// Create a new part with product link for a car
export const createPart = mutation({
  args: {
    carId: v.id("cars"),
    name: v.string(),
    category: v.string(),
    price: v.optional(v.number()),
    purchaseUrl: v.optional(v.string()), // URL to purchase the part
    description: v.optional(v.string()),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      const user = await getUser(ctx);

      // Rate limit part creation
      checkRateLimit("createPart", user.id);

      // Verify car exists and belongs to user
      const car = await ctx.db.get(args.carId);
      if (!car) {
        throw new ConvexError("Car not found");
      }
      if (car.userId !== user.id) {
        throw new ConvexError("Not authorized to add parts to this car");
      }

      // Create part record with sanitized inputs
      const partId = await ctx.db.insert("parts", {
        carId: args.carId,
        userId: user.id,
        name: sanitizeText(args.name, MAX_LENGTHS.partName) || args.name,
        category: sanitizeText(args.category, MAX_LENGTHS.carField) || args.category,
        price: sanitizeNumber(args.price, 0, 1000000),
        purchaseUrl: sanitizeUrl(args.purchaseUrl) ?? "",
        description: sanitizeText(args.description, MAX_LENGTHS.partDescription) ?? "",
        image: args.image,
      });

      return { partId };
    } catch (error) {
      if (error instanceof ConvexError) {
        throw error;
      }
      throw new ConvexError("Failed to create part. Please try again.");
    }
  },
});


// Get all parts for a specific car
export const getCarParts = query({
  args: { carId: v.id("cars") },
  handler: async (ctx, args) => {
    const parts = await ctx.db
      .query("parts")
      .withIndex("by_car", (q) => q.eq("carId", args.carId))
      .collect();

    return parts;
  },
});

// Delete a part
export const deletePart = mutation({
  args: {
    partId: v.id("parts"),
  },
  handler: async (ctx, args) => {
    try {
      const user = await getUser(ctx);

      const part = await ctx.db.get(args.partId);

      if (!part) {
        throw new ConvexError("Part not found");
      }

      if (part.userId !== user.id) {
        throw new ConvexError("Not authorized to delete this part");
      }

      // Delete the part record
      await ctx.db.delete(args.partId);

      return { success: true };
    } catch (error) {
      throw new ConvexError("Not authorized");
    }
  },
});
