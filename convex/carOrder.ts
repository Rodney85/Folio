import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ConvexError } from "convex/values";
import { Id } from "./_generated/dataModel";
import { getUser } from "./auth";

// Update car order for drag-and-drop rearrangement
export const updateCarOrder = mutation({
  args: {
    id: v.id("cars"),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    try {
      const user = await getUser(ctx);
      
      const car = await ctx.db.get(args.id);
      
      if (!car) {
        throw new ConvexError("Car not found");
      }
      
      if (car.userId !== user.id) {
        throw new ConvexError("Not authorized to update this car");
      }

      await ctx.db.patch(args.id, { order: args.order });
      
      return { success: true };
    } catch (error) {
      throw new ConvexError("Not authorized");
    }
  },
});

// Get user cars sorted by order
export const getUserCarsSorted = query({
  handler: async (ctx) => {
    try {
      const user = await getUser(ctx);
      
      const cars = await ctx.db
        .query("cars")
        .withIndex("by_user", (q) => q.eq("userId", user.id))
        .collect();

      // Sort by order field, falling back to creation date if order is not set
      return cars.sort((a, b) => {
        if (a.order !== undefined && b.order !== undefined) {
          return a.order - b.order;
        } else if (a.order !== undefined) {
          return -1; // a has order, b doesn't
        } else if (b.order !== undefined) {
          return 1;  // b has order, a doesn't
        } else {
          // Neither has order, sort by creation date (newest first)
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        }
      });
    } catch (error) {
      return [];
    }
  },
});
