import { useUser } from "@clerk/clerk-react";
import { useEffect } from "react";
// Using a relative path that's more explicit
import { api } from "../../convex/_generated/api";
import { useMutation, useConvexAuth } from "convex/react";

/**
 * AuthSyncProvider syncs the Clerk user data with Convex
 * Automatically stores user information when they sign in
 */
export const AuthSyncProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUser();
  const { isAuthenticated } = useConvexAuth();
  const storeUser = useMutation(api.auth.storeUser);

  useEffect(() => {
    // Only store user when BOTH Clerk and Convex are authenticated
    // This prevents the race condition where Clerk is ready but Convex hasn't received the token yet
    if (isAuthenticated && user) {

      // Store user data in Convex, including username and role from Clerk
      storeUser({
        name: user.fullName || "", // Provide empty string fallback if fullName is null
        email: user.primaryEmailAddress?.emailAddress,
        pictureUrl: user.imageUrl,
        // Sync username from Clerk if available
        username: user.username || undefined,
        // Include role from public metadata if available
        role: user.publicMetadata?.role as string || undefined,
      }).catch(error => {
        console.error("Failed to store user data:", error);
      });
    }
  }, [isAuthenticated, user, storeUser]);

  return <>{children}</>;
};

export default AuthSyncProvider;
