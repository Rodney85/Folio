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
    createdAt: v.optional(v.string()),
    updatedAt: v.optional(v.string()),
    // Subscription information
    subscriptionPlan: v.optional(v.string()), // 'free', 'starter', 'pro'
    subscriptionEndDate: v.optional(v.number()), // Timestamp when subscription expires
    paymentProvider: v.optional(v.string()), // 'paystack'
    paymentCustomerId: v.optional(v.string()), // ID from payment provider
  }).index("by_token", ["tokenIdentifier"])
  .index("by_username", ["username"]),
  
  cars: defineTable({
    userId: v.string(),
    make: v.string(),
    model: v.string(),
    year: v.number(),
    power: v.string(),
    torque: v.optional(v.number()),
    description: v.optional(v.string()),
    images: v.optional(v.array(v.string())),
    isPublished: v.boolean(),
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
  }).index("by_car", ["carId"]),

  // Analytics events table for user-facing metrics
  analytics: defineTable({
    // Who owns this event (profile/car owner)
    userId: v.string(),
    
    // Event type and targets
    type: v.string(), // 'profile_view', 'car_view', 'product_click'
    carId: v.optional(v.id("cars")),
    partId: v.optional(v.id("parts")),
    
    // Visitor info (for unique visitor counting)
    visitorId: v.optional(v.string()),
    visitorDevice: v.optional(v.string()), // 'mobile', 'desktop', 'tablet'
    
    // Traffic source
    referrer: v.optional(v.string()),
    utmSource: v.optional(v.string()),
    utmMedium: v.optional(v.string()),
    utmCampaign: v.optional(v.string()),
    
    // Geolocation (for pro users)
    country: v.optional(v.string()),
    city: v.optional(v.string()),
    
    // Timestamps
    createdAt: v.number(), // Date.now()
  })
  .index("by_user", ["userId"])
  .index("by_user_and_type", ["userId", "type"])
  .index("by_car", ["carId"])
  .index("by_part", ["partId"])
  .index("recent_by_user", ["userId", "createdAt"])
  .index("recent_by_car", ["carId", "createdAt"]),
});
