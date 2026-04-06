import { useUser } from "@clerk/clerk-react";
import { useEffect } from "react";
import { api } from "../../convex/_generated/api";
import { useMutation, useConvexAuth } from "convex/react";
import posthog from "posthog-js";
import * as Sentry from "@sentry/react";

/**
 * AuthSyncProvider does three things on sign-in:
 *  1. Syncs Clerk user data to Convex (existing)
 *  2. Identifies the user in PostHog so analytics sessions show real people
 *  3. Sets the user context in Sentry so errors are linked to real people
 *
 * On sign-out, it resets both PostHog and Sentry to clear the identity.
 */
export const AuthSyncProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUser();
  const { isAuthenticated } = useConvexAuth();
  const storeUser = useMutation(api.auth.storeUser);

  // ─── Sign-in: sync to Convex + identify in PostHog & Sentry ───────────────
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // 1. Sync to Convex
    storeUser({
      name: user.fullName || "",
      email: user.primaryEmailAddress?.emailAddress,
      pictureUrl: user.imageUrl,
      username: user.username || undefined,
      role: user.publicMetadata?.role as string || undefined,
    }).catch((error) => {
      console.error("Failed to store user data:", error);
    });

    const email = user.primaryEmailAddress?.emailAddress;
    const name = user.fullName ?? undefined;
    const username = user.username ?? undefined;

    // 2. PostHog — link all subsequent events to this user
    posthog.identify(user.id, { email, name, username, avatar: user.imageUrl });

    // 3. Sentry — attach user context to all errors and traces
    Sentry.setUser({ id: user.id, email, username: username ?? name });

  }, [isAuthenticated, user, storeUser]);

  // ─── Sign-out: clear identity from both tools ──────────────────────────────
  useEffect(() => {
    if (isAuthenticated) return;

    posthog.reset();        // unlinks the PostHog session from the previous user
    Sentry.setUser(null);   // clears user context from future Sentry events

  }, [isAuthenticated]);

  return <>{children}</>;
};

export default AuthSyncProvider;
