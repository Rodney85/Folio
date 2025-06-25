import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";

// Create a Convex client
export const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL || "https://eager-panda-142.convex.cloud");
