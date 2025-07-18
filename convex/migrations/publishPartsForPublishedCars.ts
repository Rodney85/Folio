import { internalMutation } from "../_generated/server";

/**
 * Migration: Publish all parts that belong to published cars
 * 
 * This one-time migration ensures that all parts associated with 
 * published cars are also marked as published.
 */
export default internalMutation({
  handler: async (ctx) => {
    // Get all published cars
    const publishedCars = await ctx.db
      .query("cars")
      .filter((q) => q.eq(q.field("isPublished"), true))
      .collect();
    
    const publishedCarIds = publishedCars.map(car => car._id);
    
    // Get all parts for these cars
    let updatedCount = 0;
    
    // Process each car's parts
    for (const carId of publishedCarIds) {
      const parts = await ctx.db
        .query("parts")
        .withIndex("by_car", (q) => q.eq("carId", carId))
        .collect();
      
      // Update each part to be published
      for (const part of parts) {
        if (part.isPublished !== true) {
          await ctx.db.patch(part._id, {
            isPublished: true
          });
          updatedCount++;
        }
      }
    }
    
    // Log the result of migration
    console.log(`Migration completed: ${updatedCount} parts published from ${publishedCarIds.length} published cars`);
    
    // Record this in analytics
    await ctx.db.insert("analytics", {
      type: "system_migration",
      migrationName: "publish_parts_for_published_cars",
      updatedCount,
      userId: "system",
      createdAt: Date.now(),
    });
    
    return {
      success: true,
      message: `Published ${updatedCount} parts that were previously unpublished`,
      publishedCarCount: publishedCarIds.length,
      updatedPartCount: updatedCount
    };
  },
});
