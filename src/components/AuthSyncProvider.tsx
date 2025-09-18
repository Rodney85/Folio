import { useAuth, useUser } from "@clerk/clerk-react";
import { useEffect } from "react";
// Using a relative path that's more explicit
import { api } from "../../convex/_generated/api";
import { useMutation } from "convex/react";

/**
 * AuthSyncProvider syncs the Clerk user data with Convex
 * Automatically stores user information when they sign in
 */
export const AuthSyncProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUser();
  const { isSignedIn } = useAuth();
  const storeUser = useMutation(api.auth.storeUser);

  useEffect(() => {
    // If the user is signed in and user data is available
    if (isSignedIn && user) {
      
      // Store user data in Convex, including role from public metadata
      storeUser({
        name: user.fullName || "", // Provide empty string fallback if fullName is null
        email: user.primaryEmailAddress?.emailAddress,
        pictureUrl: user.imageUrl,
        // Include role from public metadata if available
        role: user.publicMetadata?.role as string || undefined,
      }).catch(error => {
        console.error("Failed to store user data:", error);
      });
    }
  }, [isSignedIn, user, storeUser]);

  return <>{children}</>;
};

export default AuthSyncProvider;
