import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    pictureUrl: v.optional(v.string()),
    tokenIdentifier: v.string(),
  }).index("by_token", ["tokenIdentifier"]),
  
  // You can add more tables for your car portfolio data
  // For example:
  cars: defineTable({
    userId: v.string(),
    make: v.string(),
    model: v.string(),
    year: v.number(),
    power: v.string(),
    description: v.optional(v.string()),
    images: v.optional(v.array(v.string())),
    isPublished: v.boolean(),
    createdAt: v.optional(v.string()),
    updatedAt: v.optional(v.string()),
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
});
