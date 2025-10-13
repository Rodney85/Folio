import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    pictureUrl: v.optional(v.string()),
    tokenIdentifier: v.string(),
    // Profile information
    username: v.optional(v.string()),
    bio: v.optional(v.string()),
    instagram: v.optional(v.string()),
    tiktok: v.optional(v.string()),
    youtube: v.optional(v.string()),
    profileCompleted: v.optional(v.boolean()), // Flag to track if profile setup is complete
    // Timestamps (can be number or string for legacy data)
    createdAt: v.optional(v.union(v.number(), v.string())),
    updatedAt: v.optional(v.union(v.number(), v.string())),
    // Admin role
    role: v.optional(v.string()),
    publicMetadata: v.optional(v.any()),
  }).index("by_token", ["tokenIdentifier"])
  .index("by_username", ["username"]),
  
  cars: defineTable({
    userId: v.string(),
    make: v.string(),
    model: v.string(),
    year: v.number(),
    // Detailed specs from the new design
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
    // Legacy fields for backward compatibility
    power: v.optional(v.string()),
    torque: v.optional(v.number()),
    description: v.optional(v.string()),
    images: v.optional(v.array(v.string())),
    isPublished: v.boolean(),
    isFeatured: v.optional(v.boolean()),
    createdAt: v.optional(v.string()),
    updatedAt: v.optional(v.string()),
    order: v.optional(v.number()),
  }).index("by_user", ["userId"]),
  
  parts: defineTable({
    carId: v.id("cars"),
    userId: v.string(),
    name: v.string(),
    category: v.string(),
    price: v.optional(v.number()),
    purchaseUrl: v.optional(v.string()),
    affiliateCode: v.optional(v.string()),
    description: v.optional(v.string()),
    image: v.optional(v.string()),
    isPublished: v.optional(v.boolean()), // Whether the part is published/visible
    isFeatured: v.optional(v.boolean()), // Whether the part should be featured in UI
  }).index("by_car", ["carId"]),

  modHotspots: defineTable({
    carId: v.id("cars"),
    partId: v.id("parts"),
    imageId: v.string(), // The storage ID of the image from the car's `images` array
    x: v.number(), // X-coordinate as a percentage (0-100)
    y: v.number(), // Y-coordinate as a percentage (0-100)
    description: v.optional(v.string()), // Optional custom description for the hotspot
  }).index("by_car_and_image", ["carId", "imageId"])
  .index("by_imageId", ["imageId"]),

  subscriptions: defineTable({
    userId: v.string(), // Clerk user ID
    status: v.string(), // trial, active, expired, canceled, on_hold, failed
    plan: v.string(), // monthly, yearly, or empty for trial
    trialStartDate: v.number(), // Timestamp in milliseconds
    trialEndDate: v.number(), // Timestamp in milliseconds
    subscriptionId: v.union(v.string(), v.null()), // Dodo Payments subscription ID
    customerId: v.union(v.string(), v.null()), // Dodo Payments customer ID
    currentPeriodEnd: v.union(v.number(), v.null()), // Timestamp in milliseconds
    canceledAt: v.union(v.number(), v.null()), // Timestamp in milliseconds
    createdAt: v.number(), // Timestamp in milliseconds
    updatedAt: v.number(), // Timestamp in milliseconds
  }).index("by_user", ["userId"])
    .index("by_subscription_id", ["subscriptionId"])
    .index("by_customer_id", ["customerId"])
    .index("by_status", ["status"]),

  analytics: defineTable({
    userId: v.string(), // User ID or "anonymous" for unauthenticated users
    type: v.string(), // Event type: profile_view, car_view, product_click, trial_started, etc.
    carId: v.optional(v.id("cars")), // Associated car ID if applicable
    partId: v.optional(v.id("parts")), // Associated part ID if applicable
    metadata: v.optional(v.any()), // Additional event data (device type, referrer, etc.)
    createdAt: v.number(), // Timestamp in milliseconds
    // Legacy fields from existing analytics data
    referrer: v.optional(v.string()),
    visitorDevice: v.optional(v.string()),
    visitorId: v.optional(v.string()),
  }).index("by_user", ["userId"])
    .index("by_type", ["type"])
    .index("by_car", ["carId"])
    .index("by_created_at", ["createdAt"])
    .index("by_user_and_type", ["userId", "type"]),
});

