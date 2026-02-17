import { mutation, query, internalQuery, internalMutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { sanitizeText, sanitizeUsername, sanitizeSocialHandle, sanitizeUrl, MAX_LENGTHS } from "./lib/sanitize";
import { checkRateLimit } from "./lib/rateLimit";

/**
 * Internal query to get user by token identifier
 */
export const getUserByToken = internalQuery({
  args: {
    tokenIdentifier: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", args.tokenIdentifier))
      .first();
    return user;
  },
});

/**
 * Create or update a user profile in the Convex database.
 * Called after Clerk authentication and from the profile edit page.
 */
export const updateProfile = mutation({
  args: {
    username: v.optional(v.string()),
    bio: v.optional(v.string()),
    instagram: v.optional(v.string()),
    tiktok: v.optional(v.string()),
    youtube: v.optional(v.string()),
    profileCompleted: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    // Rate limit profile updates
    checkRateLimit("updateProfile", identity.subject);

    // Extract user information from the token
    const tokenIdentifier = identity.tokenIdentifier;
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", tokenIdentifier))
      .first();

    const currentTimestamp = new Date().toISOString();

    if (existingUser) {
      // Sanitize and validate username
      const sanitizedUsername = args.username !== undefined
        ? sanitizeUsername(args.username)
        : undefined;

      // Check username uniqueness if changing
      if (sanitizedUsername && sanitizedUsername !== existingUser.username) {
        const existingWithUsername = await ctx.db
          .query("users")
          .withIndex("by_username", (q) => q.eq("username", sanitizedUsername))
          .first();

        if (existingWithUsername && existingWithUsername._id !== existingUser._id) {
          throw new ConvexError("Username is already taken");
        }
      }

      // Prepare update data with sanitized inputs
      const updateData: any = {
        ...(args.username !== undefined ? { username: sanitizedUsername } : {}),
        ...(args.bio !== undefined ? { bio: sanitizeText(args.bio, MAX_LENGTHS.bio) } : {}),
        ...(args.instagram !== undefined ? { instagram: sanitizeSocialHandle(args.instagram) } : {}),
        ...(args.tiktok !== undefined ? { tiktok: sanitizeSocialHandle(args.tiktok) } : {}),
        ...(args.youtube !== undefined ? { youtube: sanitizeUrl(args.youtube) } : {}),
        updatedAt: currentTimestamp,
      };

      // Only set profileCompleted if explicitly provided
      if (args.profileCompleted !== undefined) {
        updateData.profileCompleted = args.profileCompleted;
      }

      // Update existing user
      return await ctx.db.patch(existingUser._id, updateData);
    } else {
      // This case shouldn't happen often as users are typically created during auth sync
      throw new ConvexError("User not found in the database");
    }
  },
});


/**
 * Get the user's profile data.
 */
export const getProfile = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null; // Not authenticated
    }

    // Look up the user in the database
    const tokenIdentifier = identity.tokenIdentifier;
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", tokenIdentifier))
      .first();

    if (!user) {
      return null;
    }

    return {
      ...user,
    };
  },
});

/**
 * Check if the user has completed their profile setup.
 * Used to determine if we should show the onboarding flow.
 */
export const isProfileComplete = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return false; // Not authenticated
    }

    // Look up the user
    const tokenIdentifier = identity.tokenIdentifier;
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", tokenIdentifier))
      .first();

    if (!user) {
      return false; // User not found
    }

    // Consider profile complete if username is set and profileCompleted flag is true
    const isComplete = user.profileCompleted === true && !!user.username;
    return isComplete;
  },
});

/**
 * Get profile completion status with percentage and missing fields.
 * Returns completion percentage and list of fields that need to be filled.
 */
export const getProfileCompletionStatus = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { percentage: 0, missingFields: [], isComplete: false };
    }

    // Look up the user
    const tokenIdentifier = identity.tokenIdentifier;
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", tokenIdentifier))
      .first();

    if (!user) {
      return { percentage: 0, missingFields: [], isComplete: false };
    }

    // Calculate completion percentage based on field weights
    let percentage = 0;
    const missingFields: string[] = [];

    // Username: 30% (most important)
    if (user.username && user.username.trim()) {
      percentage += 30;
    } else {
      missingFields.push("username");
    }

    // Bio: 20%
    if (user.bio && user.bio.trim()) {
      percentage += 20;
    } else {
      missingFields.push("bio");
    }

    // Instagram: 15%
    if (user.instagram && user.instagram.trim()) {
      percentage += 15;
    } else {
      missingFields.push("instagram");
    }

    // TikTok: 15%
    if (user.tiktok && user.tiktok.trim()) {
      percentage += 15;
    } else {
      missingFields.push("tiktok");
    }

    // YouTube: 15%
    if (user.youtube && user.youtube.trim()) {
      percentage += 15;
    } else {
      missingFields.push("youtube");
    }

    // Profile photo: 5% (from Clerk)
    if (user.pictureUrl) {
      percentage += 5;
    } else {
      missingFields.push("profile_photo");
    }

    return {
      percentage,
      missingFields,
      isComplete: percentage === 100,
    };
  },
});

/**
 * Get a user's public profile data by username.
 * This query is accessible to unauthenticated users.
 */
export const getProfileByUsername = query({
  args: {
    username: v.string(),
  },
  handler: async (ctx, args) => {

    // Find user by username
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    if (!user) {
      return null; // User not found
    }



    // Handle the ID mismatch between auth systems
    // First, try to find cars using the direct database ID
    const carsByDatabaseId = await ctx.db
      .query("cars")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Then try to find cars using the Clerk ID format (user_xyz...)
    // Extract token identifier from user record
    const possibleClerkIds = [
      user.tokenIdentifier, // From database
      user.tokenIdentifier.split("|")[1], // Extract the part after | which is used by getUser()
      `user_${user._id.slice(0, 24)}`, // Generated format 1
      `user_${user._id}`, // Generated format 2
    ];



    // Get cars from all possible IDs
    let allCars = [...carsByDatabaseId];

    // Try each possible ID format
    for (const possibleId of possibleClerkIds) {
      if (possibleId) {
        const extraCars = await ctx.db
          .query("cars")
          .withIndex("by_user", (q) => q.eq("userId", possibleId))
          .collect();


        allCars = [...allCars, ...extraCars];
      }
    }

    // Remove duplicates by ID
    const uniqueCars = Array.from(new Map(allCars.map(car => [car._id.toString(), car])).values());



    // Now get only published cars
    // FIXED: Use more lenient check for isPublished
    const publishedCars = uniqueCars.filter(car => car.isPublished === true);

    // Sort cars by order field, identical to getUserCarsSorted query
    const sortedPublishedCars = publishedCars.sort((a, b) => {
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



    // Return only necessary public profile data
    return {
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        bio: user.bio,
        pictureUrl: user.pictureUrl,
        instagram: user.instagram,
        tiktok: user.tiktok,
        youtube: user.youtube,
      },
      cars: sortedPublishedCars, // Return cars sorted by order field
    };
  },
});

/**
 * Get a user by Clerk user ID.
 * This query is accessible to authenticated users.
 */
export const getUserById = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Find user by tokenIdentifier (Clerk user ID)
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", args.userId))
      .first();

    if (!user) {
      return null; // User not found
    }

    // Return only necessary public user data
    return {
      _id: user._id,
      name: user.name,
      username: user.username,
      bio: user.bio,
      pictureUrl: user.pictureUrl,
      instagram: user.instagram,
      tiktok: user.tiktok,
      youtube: user.youtube,
    };
  },
});

/**
 * Reset onboarding status for debugging.
 */
export const resetOnboarding = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const tokenIdentifier = identity.tokenIdentifier;
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", tokenIdentifier))
      .first();

    if (!user) {
      throw new ConvexError("User not found");
    }

    await ctx.db.patch(user._id, {
      profileCompleted: false,
    });
  },
});

export const updateDodoFields = internalMutation({
  args: {
    userId: v.id("users"),
    dodoCustomerId: v.optional(v.string()),
    dodoSubscriptionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const patchData: any = {};
    if (args.dodoCustomerId) patchData.dodoCustomerId = args.dodoCustomerId;
    if (args.dodoSubscriptionId) patchData.dodoSubscriptionId = args.dodoSubscriptionId;

    await ctx.db.patch(args.userId, patchData);
  },
});
