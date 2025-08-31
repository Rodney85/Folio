import { httpAction } from "../_generated/server";

// Lemon Squeezy configuration
const LEMON_SQUEEZY_API_KEY = process.env.LEMON_SQUEEZY_API_KEY!;
const LEMON_SQUEEZY_STORE_ID = process.env.LEMON_SQUEEZY_STORE_ID!;
const LEMON_SQUEEZY_MONTHLY_VARIANT_ID = process.env.LEMON_SQUEEZY_MONTHLY_VARIANT_ID!;
const LEMON_SQUEEZY_YEARLY_VARIANT_ID = process.env.LEMON_SQUEEZY_YEARLY_VARIANT_ID!;
const APP_URL = process.env.APP_URL || "http://localhost:5173";

/**
 * Create a checkout session for the user
 * 
 * @param plan - The plan type (monthly or yearly)
 * @param userId - The user ID to associate with this checkout
 * @returns Redirect to Lemon Squeezy checkout URL
 */
export const createCheckout = httpAction(async (ctx, request) => {
  // Parse query parameters
  const url = new URL(request.url);
  const plan = url.searchParams.get("plan");
  const userId = url.searchParams.get("userId");
  
  if (!plan || !userId) {
    return new Response(JSON.stringify({ error: "Missing required parameters" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  
  // Validate plan type
  if (plan !== "monthly" && plan !== "yearly") {
    return new Response(JSON.stringify({ error: "Invalid plan type" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  
  try {
    // Get variant ID based on plan
    const variantId = plan === "monthly" 
      ? LEMON_SQUEEZY_MONTHLY_VARIANT_ID 
      : LEMON_SQUEEZY_YEARLY_VARIANT_ID;
    
    // Create checkout URL with Lemon Squeezy API
    const response = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${LEMON_SQUEEZY_API_KEY}`,
      },
      body: JSON.stringify({
        data: {
          type: "checkouts",
          attributes: {
            checkout_data: {
              custom: {
                userId: userId,
              },
            },
            product_options: {
              redirect_url: `${APP_URL}/subscription/success`,
              receipt_button_text: "Return to Dashboard",
              receipt_link_url: `${APP_URL}/dashboard`,
            },
          },
          relationships: {
            store: {
              data: {
                type: "stores",
                id: LEMON_SQUEEZY_STORE_ID,
              },
            },
            variant: {
              data: {
                type: "variants",
                id: variantId,
              },
            },
          },
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Lemon Squeezy checkout creation failed:", errorData);
      return new Response(JSON.stringify({ error: "Failed to create checkout" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const checkoutUrl = data.data.attributes.url;
    
    // Redirect the user to the checkout URL
    return new Response(null, {
      status: 302,
      headers: {
        Location: checkoutUrl,
      },
    });
  } catch (error) {
    console.error("Error creating checkout:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
