/**
 * Migration: Fix User ID Inconsistencies
 *
 * This migration normalizes all user IDs across subscriptions, cars, parts, and analytics
 * to use the consistent Clerk ID format (user_xxx).
 *
 * Run with: npx convex run migrations:fixUserIds
 */

import { internalMutation } from "../_generated/server";
import { redactEmail } from "../lib/secureLog";

export const fixUserIds = internalMutation({
  args: {},
  handler: async (ctx) => {
    console.log("🔧 Starting user ID migration...");

    // Get all users to create ID mapping
    const users = await ctx.db.query("users").collect();
    console.log(`Found ${users.length} users`);

    // Create mapping of all ID formats to Clerk ID
    const idMap = new Map<string, string>();

    for (const user of users) {
      // Extract Clerk ID from token identifier
      let clerkId: string;
      if (user.tokenIdentifier.includes("|")) {
        clerkId = user.tokenIdentifier.split("|")[1];
      } else {
        // Fallback if token doesn't have | separator
        clerkId = user.tokenIdentifier;
      }

      // Map all formats to the Clerk ID
      idMap.set(user._id, clerkId); // Database ID → Clerk ID
      idMap.set(user.tokenIdentifier, clerkId); // Token → Clerk ID
      idMap.set(clerkId, clerkId); // Clerk ID → Clerk ID (identity)

      console.log(`User mapping: ${redactEmail(user.email)} → ${clerkId}`);
    }

    let updatedCount = 0;

    // 1. Fix subscriptions table
    console.log("\n📋 Fixing subscriptions...");
    const subscriptions = await ctx.db.query("subscriptions").collect();
    for (const subscription of subscriptions) {
      const correctId = idMap.get(subscription.userId);
      if (correctId && correctId !== subscription.userId) {
        await ctx.db.patch(subscription._id, {
          userId: correctId,
          updatedAt: Date.now(),
        });
        console.log(`✅ Fixed subscription: ${subscription.userId} → ${correctId}`);
        updatedCount++;
      }
    }

    // 2. Fix cars table
    console.log("\n🚗 Fixing cars...");
    const cars = await ctx.db.query("cars").collect();
    for (const car of cars) {
      const correctId = idMap.get(car.userId);
      if (correctId && correctId !== car.userId) {
        await ctx.db.patch(car._id, {
          userId: correctId,
        });
        console.log(`✅ Fixed car: ${car.make} ${car.model} - ${car.userId} → ${correctId}`);
        updatedCount++;
      }
    }

    // 3. Fix parts table
    console.log("\n🔧 Fixing parts...");
    const parts = await ctx.db.query("parts").collect();
    for (const part of parts) {
      const correctId = idMap.get(part.userId);
      if (correctId && correctId !== part.userId) {
        await ctx.db.patch(part._id, {
          userId: correctId,
        });
        console.log(`✅ Fixed part: ${part.name} - ${part.userId} → ${correctId}`);
        updatedCount++;
      }
    }

    // 4. Fix analytics table
    console.log("\n📊 Fixing analytics...");
    const analyticsRecords = await ctx.db.query("analytics").collect();
    for (const record of analyticsRecords) {
      if (record.userId === "anonymous") continue; // Skip anonymous records

      const correctId = idMap.get(record.userId);
      if (correctId && correctId !== record.userId) {
        await ctx.db.patch(record._id, {
          userId: correctId,
        });
        updatedCount++;
      }
    }

    console.log(`\n✨ Migration complete! Updated ${updatedCount} records.`);

    return {
      success: true,
      usersProcessed: users.length,
      recordsUpdated: updatedCount,
      idMappings: Array.from(idMap.entries()).map(([from, to]) => ({ from, to })),
    };
  },
});
