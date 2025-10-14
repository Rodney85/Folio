import { httpAction } from "../_generated/server";
import DodoPayments from "dodopayments";

// Helper function to get Dodo Payments configuration
// Only initializes when actually needed
function getDodoConfig() {
  const DODO_API_KEY = process.env.DODO_API_KEY;
  const DODO_MONTHLY_PRODUCT_ID = process.env.DODO_MONTHLY_PRODUCT_ID;
  const DODO_YEARLY_PRODUCT_ID = process.env.DODO_YEARLY_PRODUCT_ID;
  const APP_URL = process.env.VITE_APP_URL || process.env.APP_URL || "https://carfolio.cc";

  // Check if Dodo Payments is configured
  if (!DODO_API_KEY || !DODO_MONTHLY_PRODUCT_ID || !DODO_YEARLY_PRODUCT_ID) {
    return null;
  }

  const isTestMode = DODO_API_KEY.startsWith('test_') || false;

  // Log initialization mode (only in development)
  if (isTestMode) {
    console.log("🧪 Dodo Payments initialized in TEST mode");
  }

  return {
    client: new DodoPayments({ bearerToken: DODO_API_KEY }),
    monthlyProductId: DODO_MONTHLY_PRODUCT_ID,
    yearlyProductId: DODO_YEARLY_PRODUCT_ID,
    appUrl: APP_URL,
    isTestMode,
  };
}

/**
 * Create a Dodo Payments checkout session for subscriptions
 * Uses the new Checkout Sessions API
 * 
 * @param plan - The plan type (monthly or yearly)
 * @param userId - The user ID to associate with this subscription
 * @param email - User's email address
 * @param name - User's name (optional)
 * @returns Redirect to Dodo Payments checkout URL
 */
export const createCheckoutSession = httpAction(async (ctx, request) => {
  // Check if Dodo Payments is configured
  const dodoConfig = getDodoConfig();
  if (!dodoConfig) {
    console.error("Dodo Payments is not configured");
    return new Response(JSON.stringify({
      error: "Payment provider not configured. Please contact support."
    }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Parse request body for POST or query parameters for GET
  let plan: string | null = null;
  let userId: string | null = null;
  let email: string | null = null;
  let name: string | null = null;
  let discountCode: string | null = null;

  if (request.method === "POST") {
    const body = await request.json();
    plan = body.plan;
    userId = body.userId;
    email = body.email;
    name = body.name || null;
    discountCode = body.discount_code || body.discount || null;
  } else {
    const url = new URL(request.url);
    plan = url.searchParams.get("plan");
    userId = url.searchParams.get("userId");
    email = url.searchParams.get("email");
    name = url.searchParams.get("name");
    discountCode = url.searchParams.get("discount_code") || url.searchParams.get("discount");
  }

  // Validate required parameters
  if (!plan || !userId || !email) {
    console.error("Missing required parameters:", { plan, userId, email });
    return new Response(JSON.stringify({
      error: "Missing required parameters",
      required: ["plan", "userId", "email"]
    }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  
  // Validate plan type
  if (plan !== "monthly" && plan !== "yearly") {
    return new Response(JSON.stringify({ error: "Invalid plan type. Must be 'monthly' or 'yearly'" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  
  try {
    // Get product ID based on plan
    const productId = plan === "monthly"
      ? dodoConfig.monthlyProductId
      : dodoConfig.yearlyProductId;

    console.log(`Creating checkout session for user ${userId} - Plan: ${plan}, Product: ${productId}`);

    // Create a checkout session using the Checkout Sessions API
    const session = await dodoConfig.client.checkoutSessions.create({
      // Products to sell
      product_cart: [
        {
          product_id: productId,
          quantity: 1
        }
      ],
  
      // Customer information
      customer: {
        email: email,
        name: name ?? email.split("@")[0],
      },
  
      // Where to redirect after successful payment
      return_url: `${dodoConfig.appUrl}/subscription/success`,
  
      // Apply discount code for early-bird campaigns (optional)
      discount_code: discountCode || undefined,
  
      // Custom metadata for tracking
      metadata: {
        userId: userId, // Our internal user ID
        plan: plan,
        source: "web_app"
      },
  
      // Feature flags for better UX
      feature_flags: {
        allow_phone_number_collection: true,
        always_create_new_customer: false
      }
    });

    if (!session.checkout_url) {
      console.error("❌ Dodo Payments checkout session creation failed: No checkout URL returned");
      return new Response(JSON.stringify({ error: "Failed to create checkout session" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log(`✅ Checkout session created successfully: ${session.session_id}`);

    // Return the checkout URL for the frontend to redirect to
    return new Response(JSON.stringify({
      success: true,
      checkout_url: session.checkout_url,
      checkoutUrl: session.checkout_url, // Alias for compatibility
      session_id: session.session_id
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Error creating Dodo Payments checkout session:", error);

    // Provide more detailed error information
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorDetails = error instanceof Error ? error.stack : undefined;

    if (errorDetails && dodoConfig.isTestMode) {
      console.error("Error stack:", errorDetails);
    }

    return new Response(JSON.stringify({
      error: "Internal server error",
      message: errorMessage
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

/**
 * Create a customer portal session for managing subscriptions
 * 
 * @param customerId - The Dodo Payments customer ID
 * @returns Customer portal URL
 */
export const createCustomerPortal = httpAction(async (ctx, request) => {
  // Check if Dodo Payments is configured
  const dodoConfig = getDodoConfig();
  if (!dodoConfig) {
    console.error("Dodo Payments is not configured");
    return new Response(JSON.stringify({
      error: "Payment provider not configured. Please contact support."
    }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  let customerId: string | null = null;

  if (request.method === "POST") {
    const body = await request.json();
    customerId = body.customerId;
  } else {
    const url = new URL(request.url);
    customerId = url.searchParams.get("customerId");
  }

  if (!customerId) {
    return new Response(JSON.stringify({
      error: "Missing required parameter: customerId"
    }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Create a customer portal session
    const session = await dodoConfig.client.customers.customerPortal.create(customerId, {
      send_email: false
    });

    const portalUrl = (session as any)?.url || (session as any)?.link;

    if (!portalUrl) {
      console.error("Failed to create customer portal session: No URL/Link returned");
      return new Response(JSON.stringify({ error: "Failed to create portal session" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({
      portal_url: portalUrl
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating customer portal session:", error);
    return new Response(JSON.stringify({ 
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

