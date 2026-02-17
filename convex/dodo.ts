import { v } from "convex/values";
import { mutation, action, query } from "./_generated/server";
import { ConvexError } from "convex/values";
import { api, internal } from "./_generated/api";

/**
 * Dodo Payments Integration — CarFolio
 * 
 * Tiers:
 * - Pro:  $5.99/mo recurring subscription
 * - OG:   $49 one-time payment (lifetime, limited to first 100)
 * 
 * Environment Variables Required (set in Convex Dashboard):
 * - DODO_API_KEY: Your Dodo Payments API key
 * - DODO_WEBHOOK_SECRET: Webhook signing secret for verification
 * - DODO_PRODUCT_PRO_MONTHLY: Product ID for Pro monthly subscription
 * - DODO_PRODUCT_OG_LIFETIME: Product ID for OG lifetime one-time payment
 * - DODO_REDIRECT_URL: URL to redirect after successful payment
 */

// =============================================================================
// CONFIGURATION
// =============================================================================

// Dodo API: test.dodopayments.com (test mode) or live.dodopayments.com (production)
function getDodoApiBase() {
    const env = process.env.DODO_PAYMENTS_ENVIRONMENT || "test_mode";
    return env === "live_mode"
        ? "https://live.dodopayments.com"
        : "https://test.dodopayments.com";
}

// Helper to get plan config from env vars
function getPlanConfig(planType: "monthly" | "lifetime") {
    if (planType === "lifetime") {
        const productId = process.env.DODO_PRODUCT_OG_LIFETIME;
        if (!productId) {
            throw new ConvexError("DODO_PRODUCT_OG_LIFETIME not configured in Convex environment variables");
        }
        return {
            productId,
            price: 4900,  // $49.00 in cents
            name: "CarFolio OG",
            isSubscription: false,
        };
    } else {
        const productId = process.env.DODO_PRODUCT_PRO_MONTHLY;
        if (!productId) {
            throw new ConvexError("DODO_PRODUCT_PRO_MONTHLY not configured in Convex environment variables");
        }
        return {
            productId,
            price: 599,   // $5.99 in cents
            name: "CarFolio Pro",
            isSubscription: true,
        };
    }
}

// =============================================================================
// CHECKOUT SESSION
// =============================================================================

/**
 * Create a Dodo checkout session for subscription or one-time purchase.
 * Returns the checkout URL to redirect the user.
 * 
 * Uses the recommended /checkouts endpoint (Dodo's modern API).
 * Stores identity.tokenIdentifier in metadata so webhook can find the user.
 */
export const createCheckoutSession = action({
    args: {
        planType: v.union(v.literal("monthly"), v.literal("lifetime")),
        successUrl: v.string(),
        cancelUrl: v.string(),
    },
    handler: async (ctx, args): Promise<{ checkoutUrl: string }> => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new ConvexError("Must be logged in to subscribe");
        }

        const plan = getPlanConfig(args.planType);

        const apiKey = process.env.DODO_API_KEY;
        if (!apiKey) {
            throw new ConvexError("Dodo API key not configured");
        }

        // Build the request body for the /checkouts endpoint
        const requestBody: Record<string, any> = {
            billing: {
                city: "",
                country: "US",
                state: "",
                street: "",
                zipcode: "",
            },
            customer: {
                email: identity.email || "",
                name: identity.name || "CarFolio User",
            },
            product_cart: [
                {
                    product_id: plan.productId,
                    quantity: 1,
                },
            ],
            payment_link: true,
            return_url: args.successUrl,
            // ✅ FIX: Store tokenIdentifier (not subject) so webhook lookup matches
            metadata: {
                userId: identity.tokenIdentifier,
                planType: args.planType,
            },
        };

        try {
            const apiBase = getDodoApiBase();
            const endpoint = `${apiBase}/checkouts`;
            console.log(`Creating Dodo checkout for ${identity.email} (plan: ${args.planType})`);

            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Dodo API error:", response.status, errorText);
                throw new ConvexError(`Failed to create checkout session: ${response.status}`);
            }

            const session = await response.json();

            // Dodo returns payment_link for the checkout URL
            const checkoutUrl = session.payment_link || session.checkout_url || session.url;

            if (!checkoutUrl) {
                console.error("No checkout URL in Dodo response:", JSON.stringify(session));
                throw new ConvexError("No checkout URL returned from Dodo");
            }

            console.log("✅ Checkout session created successfully");
            return { checkoutUrl };
        } catch (error: any) {
            console.error("Checkout session error:", error);
            if (error instanceof ConvexError) throw error;
            throw new ConvexError("Failed to create checkout session");
        }
    },
});

// =============================================================================
// WEBHOOK HANDLER
// =============================================================================

/**
 * Process Dodo webhook events.
 * Called by the HTTP endpoint in convex/http.ts
 * 
 * The userId in metadata is identity.tokenIdentifier (e.g. "https://clerk.dev|user_xxx")
 * which matches the by_token index in the users table.
 */
export const processWebhook = mutation({
    args: {
        eventType: v.string(),
        customerId: v.optional(v.string()),
        customerEmail: v.optional(v.string()),
        subscriptionId: v.optional(v.string()),
        paymentId: v.optional(v.string()),
        planId: v.optional(v.string()),
        userId: v.optional(v.string()),
        status: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        console.log("🔔 Processing Dodo webhook:", args.eventType);

        const userId = args.userId;
        if (!userId) {
            console.error("❌ No userId in metadata");
            return { success: false, error: "No user ID" };
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", userId))
            .first();

        if (!user) {
            console.error("❌ User not found:", userId);
            return { success: false, error: "User not found" };
        }

        // Extract customerId from args or legacy fields if available
        // Note: args.customerId might be passed if defined in args above
        const dodoCustomerId = args.customerId;

        // Update user's Dodo fields if present
        if (dodoCustomerId && dodoCustomerId !== user.dodoCustomerId) {
            await ctx.db.patch(user._id, { dodoCustomerId });
        }

        // Prepare update object for generic updates
        const updateData: any = {
            updatedAt: Date.now(),
        };

        switch (args.eventType) {
            case "payment.succeeded":
                // 1. Update User (Fast Access)
                await ctx.db.patch(user._id, {
                    subscriptionStatus: "active",
                    planId: args.planId || undefined,
                    updatedAt: Date.now(),
                    dodoCustomerId: dodoCustomerId || user.dodoCustomerId, // Ensure it's saved
                });

                // 2. Log Payment (Audit Trail)
                if (args.paymentId) {
                    await ctx.db.insert("payments", {
                        paymentId: args.paymentId,
                        userId: userId,
                        amount: 0, // Placeholder
                        currency: "USD",
                        status: "succeeded",
                        createdAt: Date.now(),
                    });
                }
                console.log("✅ Subscription ACTIVATED & Payment Logged for:", user.name || userId);
                break;

            case "subscription.created":
            case "subscription.active":
                // 1. Update User
                await ctx.db.patch(user._id, {
                    subscriptionStatus: "active",
                    planId: args.planId || undefined,
                    updatedAt: Date.now(),
                    dodoCustomerId: dodoCustomerId || user.dodoCustomerId, // Ensure it's saved
                });

                // 2. Log Subscription (Audit Trail)
                if (args.subscriptionId) {
                    const existing = await ctx.db
                        .query("subscriptions")
                        .withIndex("by_dodo_id", q => q.eq("subscriptionId", args.subscriptionId!))
                        .first();

                    if (!existing) {
                        await ctx.db.insert("subscriptions", {
                            subscriptionId: args.subscriptionId,
                            userId: userId,
                            planId: args.planId || "unknown",
                            status: "active",
                            dodoCustomerId: args.customerId,
                            createdAt: Date.now(),
                            updatedAt: Date.now(),
                        });
                    }
                }
                console.log("✅ Subscription ACTIVATED for user:", user.name || userId);
                break;

            case "subscription.updated":
                // Update status based on what Dodo reports
                const newStatus = args.status === "active" ? "active" : args.status || "active";
                updateData.subscriptionStatus = newStatus;
                await ctx.db.patch(user._id, updateData);

                // Update Subscription Record
                if (args.subscriptionId) {
                    const sub = await ctx.db
                        .query("subscriptions")
                        .withIndex("by_dodo_id", q => q.eq("subscriptionId", args.subscriptionId!))
                        .first();

                    if (sub) {
                        await ctx.db.patch(sub._id, {
                            status: newStatus,
                            updatedAt: Date.now(),
                        });
                    }
                }
                console.log("🔄 Subscription UPDATED for user:", user.name || userId, "→", newStatus);
                break;

            case "subscription.cancelled":
            case "subscription.expired":
                updateData.subscriptionStatus = "cancelled";
                await ctx.db.patch(user._id, updateData);

                // Update Subscription Record
                if (args.subscriptionId) {
                    const sub = await ctx.db
                        .query("subscriptions")
                        .withIndex("by_dodo_id", q => q.eq("subscriptionId", args.subscriptionId!))
                        .first();

                    if (sub) {
                        await ctx.db.patch(sub._id, {
                            status: "cancelled",
                            updatedAt: Date.now(),
                        });
                    }
                }
                console.log("❌ Subscription CANCELLED for user:", user.name || userId);
                break;

            case "payment.failed":
                updateData.subscriptionStatus = "payment_failed";

                await ctx.db.patch(user._id, updateData);

                if (args.paymentId) {
                    await ctx.db.insert("payments", {
                        paymentId: args.paymentId,
                        userId: userId,
                        amount: 0,
                        currency: "USD",
                        status: "failed",
                        createdAt: Date.now(),
                    });
                }
                console.log("❌ Payment FAILED for user:", user.name || userId);
                break;

            case "refund.succeeded":
                updateData.subscriptionStatus = "refunded";

                await ctx.db.patch(user._id, updateData);
                console.log("💰 Refund processed for user:", user.name || userId);
                break;

            default:
                // Still update IDs even if event is generic
                if (Object.keys(updateData).length > 1) { // 1 is just updatedAt
                    await ctx.db.patch(user._id, updateData);
                }
                console.log("ℹ️ Unhandled webhook event:", args.eventType);
        }

        return { success: true };
    },
});

// =============================================================================
// CUSTOMER PORTAL
// =============================================================================



// =============================================================================
// DEBUG — Manual subscription toggle (run from Convex Dashboard)
// =============================================================================

/**
 * Manually set a user's subscription status.
 * Use this from the Convex Dashboard for testing.
 * 
 * Find your tokenIdentifier in the users table, then call:
 *   debugSetSubscription({ tokenIdentifier: "https://...|user_xxx", status: "active", planId: "monthly" })
 */
export const debugSetSubscription = mutation({
    args: {
        tokenIdentifier: v.string(),
        status: v.string(),
        planId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", args.tokenIdentifier))
            .first();

        if (!user) {
            throw new ConvexError(`User not found: ${args.tokenIdentifier}`);
        }

        await ctx.db.patch(user._id, {
            subscriptionStatus: args.status,
            planId: args.planId || undefined,
            updatedAt: Date.now(),
        });

        console.log(`🔧 Debug: Set subscription for ${user.name || user.username} → ${args.status}`);
        return { success: true, userName: user.name || user.username };
    },
});

export const debugListUsers = query({
    handler: async (ctx) => {
        const users = await ctx.db.query("users").collect();
        return users.map(u => ({
            id: u._id,
            name: u.name,
            email: u.email,
            tokenIdentifier: u.tokenIdentifier,
            subscriptionStatus: u.subscriptionStatus,
            dodoCustomerId: u.dodoCustomerId,
            planId: u.planId,
        }));
    },
});

// =============================================================================
// SUBSCRIPTION STATUS QUERIES
// =============================================================================

export const isSubscribed = query({
    handler: async (ctx): Promise<boolean> => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return false;

        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
            .first();

        if (!user) return false;

        return user.subscriptionStatus === "active";
    },
});

export const getSubscriptionStatus = query({
    handler: async (ctx): Promise<{
        status: string | null;
        isActive: boolean;
        dodoCustomerId?: string;
    }> => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return { status: null, isActive: false };
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
            .first();

        if (!user) {
            return { status: null, isActive: false };
        }

        const status = user.subscriptionStatus || null;
        return {
            status,
            isActive: status === "active",
            dodoCustomerId: user.dodoCustomerId,
        };
    },
});

export const getOgUserCount = query({
    handler: async (ctx) => {
        // Read OG product ID from env, fall back to checking any user with planId set
        const ogProductId = process.env.DODO_PRODUCT_OG_LIFETIME;
        if (!ogProductId) {
            // If env var not set, count all users with a planId containing "hSeo" (legacy)
            const allUsers = await ctx.db.query("users").collect();
            return allUsers.filter(u => u.planId && u.planId.includes("hSeo")).length;
        }

        const ogUsers = await ctx.db
            .query("users")
            .withIndex("by_planId", (q) => q.eq("planId", ogProductId))
            .collect();
        return ogUsers.length;
    },
});

// =============================================================================
// CUSTOMER PORTAL
// =============================================================================

/**
 * Helper: Find Dodo customer ID by email via API.
 */
async function getCustomerIdByEmail(email: string): Promise<string | null> {
    const apiKey = process.env.DODO_API_KEY;
    if (!apiKey) return null;

    try {
        const apiBase = getDodoApiBase();
        const response = await fetch(`${apiBase}/customers?email=${encodeURIComponent(email)}`, {
            headers: {
                "Authorization": `Bearer ${apiKey}`,
            },
        });

        if (!response.ok) return null;

        const data = await response.json();
        // Handle array response or { data: [] }
        if (Array.isArray(data) && data.length > 0) return data[0].customer_id;
        if (data.data && Array.isArray(data.data) && data.data.length > 0) return data.data[0].customer_id;

        return null;
    } catch (error) {
        console.error("Error looking up Dodo customer:", error);
        return null;
    }
}

export const createCustomerPortalSession = action({
    args: {
        returnUrl: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new ConvexError("Not authenticated");
        }

        const user = await ctx.runQuery(internal.users.getUserByToken, { tokenIdentifier: identity.tokenIdentifier });
        if (!user) throw new ConvexError("User not found");

        let customerId = user.dodoCustomerId;

        // Fallback: Lookup by email if not stored
        if (!customerId && identity.email) {
            console.log(`🔍 Looking up Dodo customer ID for ${identity.email}`);
            customerId = await getCustomerIdByEmail(identity.email) || undefined;

            // Optimization: Store it for next time
            if (customerId) {
                await ctx.runMutation(internal.users.updateDodoFields, {
                    userId: user._id,
                    dodoCustomerId: customerId,
                });
            }
        }

        if (!customerId) {
            throw new ConvexError("No billing account found. Please contact support.");
        }

        const apiKey = process.env.DODO_API_KEY;
        const apiBase = getDodoApiBase();

        // POST /customers/{id}/customer-portal/session
        const response = await fetch(`${apiBase}/customers/${customerId}/customer-portal/session`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                return_url: args.returnUrl,
            }),
        });

        if (!response.ok) {
            const err = await response.text();
            console.error("Dodo portal creation failed:", err);
            throw new ConvexError("Failed to create portal session");
        }

        const session = await response.json();
        return { portalUrl: session.link || session.url };
    },
});
