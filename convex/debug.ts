import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Debug query to find all cars in the system
 * This will help identify what userId format is used in the cars table
 */
export const getAllCarsDebug = query({
  args: {},
  handler: async (ctx) => {
    // Get all cars in the database to see what userId formats exist
    const allCars = await ctx.db
      .query("cars")
      .collect();
    
    // Map cars to only show necessary debugging info
    const carDetails = allCars.map(car => ({
      carId: car._id,
      userId: car.userId,
      make: car.make,
      model: car.model,
      year: car.year,
      isPublished: car.isPublished
    }));
    
    // Count unique userIds
    const uniqueUserIds = new Set(allCars.map(car => car.userId));
    const userIdFormats = Array.from(uniqueUserIds);
    
    console.log(`Found ${allCars.length} total cars in database`);
    console.log(`Cars are associated with ${uniqueUserIds.size} unique userIds`);
    console.log(`UserId formats found:`, userIdFormats);
    
    return {
      totalCars: allCars.length,
      uniqueUserIds: userIdFormats,
      carDetails
    };
  },
});
