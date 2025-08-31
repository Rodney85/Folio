import { api } from "../../convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { SubscriptionStatus } from "../../convex/subscriptions";

/**
 * Hook to check if the current authenticated user has subscription access
 * Returns true if the user is in an active trial or has a paid subscription
 */
export function useHasSubscriptionAccess() {
  // Use 'any' type to avoid deep instantiation error
  const hasAccess: any = useQuery(api.subscriptions.checkUserAccess);
  return Boolean(hasAccess);
}

/**
 * Hook to get current user's subscription details
 */
export function useCurrentSubscription() {
  const subscription = useQuery(api.subscriptions.getUserSubscription);
  return subscription;
}

/**
 * Check if a specific user ID has subscription access (for public profiles)
 * Used for determining if a public car page should be viewable
 */
export async function checkPublicProfileAccess(userId: string) {
  try {
    // Use a direct HTTP fetch to the API endpoint
    const response = await fetch(`/api/checkPublicUserAccess?userId=${userId}`);
    const data = await response.json();
    return data.hasAccess === true;
  } catch (error) {
    console.error("Error checking profile access:", error);
    return false;
  }
}

/**
 * Start a trial for a new user
 */
export function useStartUserTrial() {
  const startTrial = useMutation(api.subscriptions.startUserTrial);
  
  const startTrialFn = async () => {
    try {
      return await startTrial();
    } catch (error) {
      console.error("Error starting trial:", error);
      return null;
    }
  };
  
  return startTrialFn;
}

/**
 * Check if a user needs to start a trial
 * Returns true if the user has no subscription record
 */
export function useNeedsTrialSetup() {
  const subscription = useCurrentSubscription();
  return !subscription || subscription.status === "none";
}

/**
 * Check if a trial has ended and user needs to subscribe
 */
export function useTrialEnded() {
  const subscription = useCurrentSubscription();
  return subscription?.trialEnded || false;
}

/**
 * Get days remaining in trial or subscription
 */
export function useDaysRemaining() {
  const subscription = useCurrentSubscription();
  return subscription?.daysRemaining || 0;
}
