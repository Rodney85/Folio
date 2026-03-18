import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api, internal } from "./_generated/api";

const http = httpRouter();

// =============================================================================
// Clerk Webhook
// POST /webhooks/clerk
// =============================================================================

http.route({
    path: "/webhooks/clerk",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
        try {
            const rawBody = await request.text();
            console.log("🔔 Webhook request received from Clerk");

            const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
            if (!webhookSecret) {
                console.error("❌ CLERK_WEBHOOK_SECRET is missing!");
                return new Response("Internal Server Error", { status: 500 });
            }

            const svixId = request.headers.get("svix-id");
            const svixTimestamp = request.headers.get("svix-timestamp");
            const svixSignature = request.headers.get("svix-signature");

            if (!svixId || !svixTimestamp || !svixSignature) {
                console.warn("⚠️ Clerk webhook missing svix headers");
                return new Response("Missing svix headers", { status: 400 });
            }

            // Verify signature using Web Crypto (Svix standard)
            const signedMessage = `${svixId}.${svixTimestamp}.${rawBody}`;
            const secretBytes = Uint8Array.from(
                atob(webhookSecret.replace(/^whsec_/, "")),
                (c) => c.charCodeAt(0)
            );

            const key = await crypto.subtle.importKey(
                "raw",
                secretBytes,
                { name: "HMAC", hash: "SHA-256" },
                false,
                ["sign"]
            );
            const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signedMessage));
            const computed = `v1,${btoa(String.fromCharCode(...new Uint8Array(sig)))}`;

            const signatures = svixSignature.split(" ");
            const isValid = signatures.some((s) => s === computed);

            if (!isValid) {
                console.error("Clerk Webhook signature verification FAILED");
                return new Response("Invalid signature", { status: 400 });
            }

            const payload = JSON.parse(rawBody);
            console.log(`📦 Clerk Webhook event: ${payload.type}`);

            if (payload.type === "user.deleted") {
                const clerkUserId = payload.data.id;
                await ctx.runMutation(internal.users.handleUserDeleted, { clerkUserId });
                console.log(`✅ Completed cleanup for deleted user: ${clerkUserId}`);
            } else if (payload.type === "user.created" || payload.type === "user.updated") {
                // Future syncing can be implemented here if needed.
                const clerkUserData = payload.data;
                await ctx.runMutation(internal.users.syncUserFromClerk, { 
                    clerkUserId: clerkUserData.id,
                    email: clerkUserData.email_addresses?.[0]?.email_address,
                    firstName: clerkUserData.first_name,
                    lastName: clerkUserData.last_name,
                    imageUrl: clerkUserData.image_url,
                });
                console.log(`✅ Synced user data for: ${clerkUserData.id}`);
            }

            return new Response(JSON.stringify({ success: true }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        } catch (error: any) {
            console.error("Clerk Webhook processing error:", error.message);
            return new Response("Webhook processing failed", { status: 500 });
        }
    }),
});

// =============================================================================
// Dodo Payments Webhook
// POST /webhooks/dodo
//
// Dodo follows the Standard Webhooks spec:
// Headers: webhook-id, webhook-timestamp, webhook-signature
// Signature: HMAC-SHA256 of "${webhook-id}.${webhook-timestamp}.${rawBody}"
// =============================================================================

http.route({
    path: "/webhooks/dodo",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
        try {
            // Read the raw body FIRST (needed for signature verification)
            const rawBody = await request.text();

            console.log("🔔 Webhook request received from Dodo");

            // ── Signature Verification ──────────────────────────────────
            const webhookSecret = process.env.DODO_WEBHOOK_SECRET;
            const signature = request.headers.get("webhook-signature");
            const webhookId = request.headers.get("webhook-id");
            const webhookTimestamp = request.headers.get("webhook-timestamp");

            if (webhookSecret && signature && webhookId && webhookTimestamp) {
                try {
                    // Standard Webhooks: signed message = "${id}.${timestamp}.${body}"
                    const signedMessage = `${webhookId}.${webhookTimestamp}.${rawBody}`;

                    // Decode the base64 secret (Dodo secrets are base64-encoded)
                    const secretBytes = Uint8Array.from(
                        atob(webhookSecret.replace(/^whsec_/, "")),
                        (c) => c.charCodeAt(0)
                    );

                    // Compute HMAC-SHA256
                    const key = await crypto.subtle.importKey(
                        "raw",
                        secretBytes,
                        { name: "HMAC", hash: "SHA-256" },
                        false,
                        ["sign"]
                    );
                    const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signedMessage));
                    const computed = `v1,${btoa(String.fromCharCode(...new Uint8Array(sig)))}`;

                    // Compare — the header may contain multiple sigs separated by spaces
                    const signatures = signature.split(" ");
                    const isValid = signatures.some((s) => s === computed);

                    if (!isValid) {
                        console.error("Webhook signature verification FAILED");
                        console.error("Computed:", computed);
                        console.error("Received:", signature);
                        console.warn("⚠️ Processing webhook despite signature mismatch (debug mode)");
                    } else {
                        console.log("✅ Webhook signature verified");
                    }
                } catch (err: any) {
                    console.error("Signature verification crashed:", err.message);
                    // Check if secret looks wrong
                    if (!webhookSecret.startsWith("whsec_")) {
                        console.error("⚠️ DODO_WEBHOOK_SECRET should likely start with 'whsec_'");
                    }
                }
            } else {
                console.warn("⚠️ Webhook received without full signature headers — processing anyway");
                if (!webhookSecret) console.error("❌ DODO_WEBHOOK_SECRET is missing!");
            }

            // Parse body for processing
            const body = JSON.parse(rawBody);

            // ── Extract Fields from Dodo Payload ────────────────────────
            // Dodo uses "event_type" (not "type")
            const eventType = body.event_type || body.type || "";
            const data = body.data || {};
            const metadata = data.metadata || body.metadata || {};

            console.log("📦 Webhook event:", eventType);
            console.log("📦 Metadata:", JSON.stringify(metadata));
            console.log("📦 Data keys:", Object.keys(data).join(", "));

            // Extract the product ID from the payload
            // Dodo may send it in product_cart, product_id, or the metadata
            // Extract the product ID from the payload
            // Dodo may send it in product_cart, product_id, or the metadata
            // Extract the product ID from the payload
            // Dodo may send it in product_cart, product_id, or the metadata
            const productId =
                data.product_cart?.[0]?.product_id ||
                data.product_id ||
                metadata?.planType ||
                metadata?.planId ||
                undefined;

            const subscriptionId = data.subscription_id || data.subscription?.subscription_id || metadata?.subscriptionId || undefined;

            console.log("🐛 DEBUG extraction:");
            console.log(" - data.customer:", JSON.stringify(data.customer));
            console.log(" - data.customer_id:", data.customer_id);
            console.log(" - data.subscription_id:", data.subscription_id);
            console.log(" - EXTRACTED customerId:", data.customer?.customer_id || data.customer_id);
            console.log(" - EXTRACTED subscriptionId:", subscriptionId);
            console.log(" - EXTRACTED productId (planId):", productId);

            // @ts-ignore — Convex deep type instantiation with many optional args
            await ctx.runMutation(api.dodo.processWebhook, {
                eventType,
                customerId: data.customer?.customer_id || data.customer_id || undefined,
                customerEmail: data.customer?.email || undefined,
                subscriptionId: subscriptionId,
                paymentId: data.payment_id || data.id || undefined,
                planId: productId,
                userId: metadata?.userId || undefined,
                status: data.status || undefined,
            });

            return new Response(JSON.stringify({ received: true }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        } catch (error) {
            console.error("Webhook processing error:", error);
            return new Response(JSON.stringify({ error: "Webhook processing failed" }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            });
        }
    }),
});

export default http;
