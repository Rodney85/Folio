import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";

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
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    // Extract user information from the token
    const tokenIdentifier = identity.tokenIdentifier;
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", tokenIdentifier))
      .first();

    const currentTimestamp = new Date().toISOString();

    if (existingUser) {
      // Update existing user
      return await ctx.db.patch(existingUser._id, {
        ...(args.username !== undefined ? { username: args.username } : {}),
        ...(args.bio !== undefined ? { bio: args.bio } : {}),
        ...(args.instagram !== undefined ? { instagram: args.instagram } : {}),
        ...(args.tiktok !== undefined ? { tiktok: args.tiktok } : {}),
        ...(args.youtube !== undefined ? { youtube: args.youtube } : {}),
        profileCompleted: true,
        updatedAt: currentTimestamp,
      });
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

    return user;
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
    return user.profileCompleted === true && !!user.username;
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
    console.log(`Looking for profile with username: ${args.username}`);
    
    // Find user by username
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();
    
    if (!user) {
      console.log(`No user found with username: ${args.username}`);
      return null; // User not found
    }
    
    console.log(`Found user: ${user._id}, username: ${user.username}`);
    
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
    
    console.log("Possible user IDs to check:", possibleClerkIds);
    
    // Get cars from all possible IDs
    let allCars = [...carsByDatabaseId];
    
    // Try each possible ID format
    for (const possibleId of possibleClerkIds) {
      if (possibleId) {
        const extraCars = await ctx.db
          .query("cars")
          .withIndex("by_user", (q) => q.eq("userId", possibleId))
          .collect();
          
        console.log(`Found ${extraCars.length} cars with userId: ${possibleId}`);
        allCars = [...allCars, ...extraCars];
      }
    }
    
    // Remove duplicates by ID
    const uniqueCars = Array.from(new Map(allCars.map(car => [car._id.toString(), car])).values());
    
    console.log(`User has ${uniqueCars.length} total unique cars in database`);
    
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
    
    console.log(`User has ${sortedPublishedCars.length} published cars, now sorted by order`);
    
    // Log the first car's data structure for debugging
    if (allCars.length > 0) {
      console.log('First car data structure:', JSON.stringify(allCars[0], null, 2));
    }
    
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
