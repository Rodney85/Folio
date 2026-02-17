/**
 * Subscription Plan Constants — CarFolio
 * 
 * Used by frontend components to reference plan tiers.
 * Product IDs are stored in Convex environment variables on the backend.
 */

export const SubscriptionPlan = {
    FREE: "free",
    PRO: "pro",
    OG: "og",
} as const;

export type SubscriptionPlanType = typeof SubscriptionPlan[keyof typeof SubscriptionPlan];

export const PLAN_DETAILS = {
    [SubscriptionPlan.FREE]: {
        name: "Free",
        price: 0,
        description: "Get started with CarFolio",
        carLimit: 3,
    },
    [SubscriptionPlan.PRO]: {
        name: "Pro",
        price: 599, // $5.99 in cents
        description: "For serious builders",
        carLimit: Infinity,
    },
    [SubscriptionPlan.OG]: {
        name: "OG",
        price: 4900, // $49.00 in cents
        description: "Founding member, forever access",
        carLimit: Infinity,
    },
} as const;
