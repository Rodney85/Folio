import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";

// Create a Convex client
// IMPORTANT: VITE_CONVEX_URL must be set in .env.local
const convexUrl = import.meta.env.VITE_CONVEX_URL;

if (!convexUrl) {
  throw new Error(
    "Missing VITE_CONVEX_URL environment variable. " +
    "Run 'npx convex dev' to set it up."
  );
}

export const convex = new ConvexReactClient(convexUrl);
