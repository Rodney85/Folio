import { internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { WelcomeEmail, SubscriptionSuccessEmail, SubscriptionFailedEmail, SystemNotificationEmail, SubscriptionCancelledEmail, RefundProcessedEmail, IssueReceivedEmail, IssueResolvedEmail, GarageLimitEmail, TalentScoutEmail, ShopManagerEmail, InfluencerEmail, VisionaryEmail, BuildValueEmail } from "./email/templates";

// Helper to render React templates to HTML strings (since component expects HTML or React if configured)
// Note: The component might handle React directly if configured, but often sending HTML is safer across boundaries if types mismatch
// However, @convex-dev/resend usually takes 'react' prop if using the 'resend' SDK types.
// Let's assume we pass the React element to the component action if it supports it, or use a render function.
// For now, I'll keep the logic similar but call the component.

export const triggerNotification = internalMutation({
    args: {
        userId: v.string(), // Clerk ID or Database ID
        email: v.optional(v.string()), // Optional: Pass email directly to bypass lookup
        type: v.string(), // "welcome", "subscription_success", "subscription_failed", "system"
        // Use explicit schema instead of v.any() to avoid "excessively deep" type recursion
        data: v.optional(v.object({
            firstName: v.optional(v.string()), // For email personalisation
            actionUrl: v.optional(v.string()), // Call to action link
            subject: v.optional(v.string()), // Custom subject
            message: v.optional(v.string()), // System message body
        })),
    },
    handler: async (ctx, args) => {
        // 1. Get User Profile (optional if email is provided)
        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", args.userId))
            .first();

        const email = args.email || user?.email;
        const name = args.data?.firstName || user?.name || user?.username || "User";

        if (!email) {
            console.warn(`User ${args.userId} not found and no email provided, skipping notification`);
            return;
        }

        // 3. Determine Action URL (Link)
        const baseUrl = process.env.SITE_URL || "https://www.carfolio.cc";
        let actionUrl = args.data?.actionUrl;

        if (!actionUrl) {
            switch (args.type) {
                case "welcome":
                    actionUrl = `${baseUrl}/profile`;
                    break;
                case "subscription_success":
                    actionUrl = `${baseUrl}/dashboard`;
                    break;
                case "subscription_failed":
                    actionUrl = `${baseUrl}/settings/billing`;
                    break;
                case "garage_limit":
                    actionUrl = `${baseUrl}/pricing`;
                    break;
                case "talent_scout":
                case "visionary":
                    actionUrl = `${baseUrl}/garage`;
                    break;
                case "shop_manager":
                    actionUrl = `${baseUrl}/garage?tab=parts`;
                    break;
                case "influencer_stats":
                    actionUrl = `${baseUrl}/analytics`;
                    break;
                case "build_value":
                    actionUrl = `${baseUrl}/garage?tab=value`;
                    break;
                default:
                    actionUrl = baseUrl;
            }
        }

        const emailData = {
            firstName: name,
            actionUrl: actionUrl,
            ...args.data
        };

        let subject = "Notification from CarFolio";
        let reactElement: React.ReactNode;

        switch (args.type) {
            case "welcome":
                subject = "Welcome to CarFolio!";
                reactElement = <WelcomeEmail firstName={emailData.firstName} actionUrl={emailData.actionUrl} />;
                break;
            case "subscription_success":
                subject = "You're Pro!";
                reactElement = <SubscriptionSuccessEmail firstName={emailData.firstName} actionUrl={emailData.actionUrl} />;
                break;
            case "subscription_failed":
                subject = "Action Required: Payment Failed";
                reactElement = <SubscriptionFailedEmail firstName={emailData.firstName} actionUrl={emailData.actionUrl} />;
                break;
            case "system":
                subject = args.data?.subject || "System Notification";
                reactElement = <SystemNotificationEmail message={args.data?.message} />;
                break;
            case "subscription_cancelled":
                subject = "Subscription Cancelled";
                reactElement = <SubscriptionCancelledEmail firstName={emailData.firstName} actionUrl={emailData.actionUrl} />;
                break;
            case "refund_processed":
                subject = "Refund Processed";
                reactElement = <RefundProcessedEmail firstName={emailData.firstName} message={emailData.message} />;
                break;
            case "issue_received":
                subject = `We received your report: ${args.data?.subject || "Issue"}`;
                reactElement = <IssueReceivedEmail firstName={emailData.firstName} issueTitle={args.data?.subject || "Unknown Issue"} />;
                break;
            case "issue_resolved":
                subject = `Issue Resolved: ${args.data?.subject || "Issue"}`;
                reactElement = <IssueResolvedEmail firstName={emailData.firstName} issueTitle={args.data?.subject || "Unknown Issue"} />;
                break;
            case "garage_limit":
                subject = "Your garage is full";
                reactElement = <GarageLimitEmail firstName={emailData.firstName} actionUrl={emailData.actionUrl} />;
                break;
            case "talent_scout":
                subject = "Your build is turning heads";
                reactElement = <TalentScoutEmail firstName={emailData.firstName} carModel={args.data?.message || "Car"} actionUrl={emailData.actionUrl} />;
                break;
            case "shop_manager":
                subject = "Don't leave money on the table";
                reactElement = <ShopManagerEmail firstName={emailData.firstName} carModel={args.data?.message || "Car"} missingCount={Number(args.data?.subject) || 0} actionUrl={emailData.actionUrl} />;
                break;
            case "influencer_stats":
                subject = "Your bio link is working overtime";
                reactElement = <InfluencerEmail firstName={emailData.firstName} viewCount={Number(args.data?.message) || 0} actionUrl={emailData.actionUrl} />;
                break;
            case "visionary":
                subject = "Visualize your build";
                reactElement = <VisionaryEmail firstName={emailData.firstName} carModel={args.data?.message || "Car"} actionUrl={emailData.actionUrl} />;
                break;
            case "build_value":
                subject = "Your Build Value Update";
                reactElement = <BuildValueEmail firstName={emailData.firstName} carModel={args.data?.message || "Car"} totalValue={Number(args.data?.subject) || 0} actionUrl={emailData.actionUrl} />;
                break;
            default:
                console.error("Unknown notification type:", args.type);
                return;
        }

        // 3. Determine Sender Identity (Dynamic Personas)
        const defaultSender = process.env.RESEND_FROM_EMAIL || "CarFolio <onboarding@resend.dev>";
        let fromAddress = defaultSender;

        // Extract domain to construct new emails (e.g. from "Support <support@carfolio.com>" get "carfolio.com")
        // Only customize if we are likely on a verified domain (not resend.dev default)
        if (!defaultSender.includes("@resend.dev")) {
            const domainMatch = defaultSender.match(/@([^>]+)/);
            const domain = domainMatch ? domainMatch[1].trim() : null;

            if (domain) {
                switch (args.type) {
                    // The Accountant (Billing & Money)
                    case "subscription_success":
                    case "subscription_failed":
                    case "subscription_cancelled":
                    case "refund_processed":
                    case "build_value":
                        fromAddress = `CarFolio Billing <billing@${domain}>`;
                        break;

                    // The Shop Manager (Updates & Alerts)
                    case "shop_manager":
                    case "garage_limit":
                        fromAddress = `CarFolio Manager <updates@${domain}>`;
                        break;

                    // The Influencer (Growth)
                    case "influencer_stats":
                    case "talent_scout":
                        fromAddress = `CarFolio Growth <growth@${domain}>`;
                        break;

                    // The Visionary (Inspiration)
                    case "visionary":
                        fromAddress = `CarFolio Vision <visionary@${domain}>`;
                        break;

                    // Default / System / Issues -> specific "Support" or "Start"
                    case "issue_received":
                    case "issue_resolved":
                    case "welcome":
                        // Keep default (usually support@ or hello@)
                        break;
                }
            }
        }

        // 4. Call Send Action
        let templateName: string = args.type;
        if (templateName === "system") {
            templateName = "system_notification";
        }

        // @ts-ignore
        await ctx.scheduler.runAfter(0, internal.email.send.send, {
            to: email,
            subject: subject,
            template: templateName,
            templateArgs: emailData,
            userId: user?._id,
            from: fromAddress,
        });

        console.log(`Notification triggered for ${email} type: ${args.type}`);
    },
});
