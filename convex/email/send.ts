import { internalAction, internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { internal, components } from "../_generated/api";
import { renderTemplate } from "./templates";

// Mutation to log the email in the database (for Admin Dashboard)
export const logEmail = internalMutation({
    args: {
        to: v.string(),
        subject: v.string(),
        template: v.string(),
        status: v.string(),
        messageId: v.optional(v.string()),
        error: v.optional(v.string()),
        userId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("sent_emails", {
            to: args.to,
            subject: args.subject,
            template: args.template,
            status: args.status,
            messageId: args.messageId,
            error: args.error,
            userId: args.userId,
            createdAt: Date.now(),
        });
    },
});

export const send = internalAction({
    args: {
        to: v.union(v.string(), v.array(v.string())),
        subject: v.string(),
        template: v.string(),
        templateArgs: v.any(),
        userId: v.optional(v.string()),
        from: v.optional(v.string()), // Optional override
    },
    handler: async (ctx, args) => {
        const apiKey = process.env.RESEND_API_KEY;
        // Use override if provided, else from env
        const fromAddress = args.from || process.env.RESEND_FROM_EMAIL;

        const toAddress = Array.isArray(args.to) ? args.to[0] : args.to; // Log primary recipient

        // STRICT CONFIGURATION CHECK
        if (!apiKey) {
            const errorMsg = "Configuration Error: RESEND_API_KEY is not set in Convex Dashboard.";
            console.error(errorMsg);
            await ctx.runMutation(internal.email.send.logEmail, {
                to: toAddress,
                subject: args.subject,
                template: args.template,
                status: "failed",
                error: errorMsg,
                userId: args.userId,
            });
            throw new Error(errorMsg);
        }

        if (!fromAddress) {
            const errorMsg = "Configuration Error: RESEND_FROM_EMAIL is not set. Please set it to your verified sender (e.g. 'Your Name <email@domain.com>').";
            console.error(errorMsg);
            await ctx.runMutation(internal.email.send.logEmail, {
                to: toAddress,
                subject: args.subject,
                template: args.template,
                status: "failed",
                error: errorMsg,
                userId: args.userId,
            });
            throw new Error(errorMsg);
        }

        // Render the React template to HTML
        let html, text;
        try {
            // @ts-ignore
            const result = renderTemplate(args.template, args.templateArgs);
            html = result.html;
            text = result.text;
        } catch (e: any) {
            const errorMsg = `Template render failed: ${e.message}`;
            console.error(errorMsg);
            await ctx.runMutation(internal.email.send.logEmail, {
                to: toAddress,
                subject: args.subject,
                template: args.template,
                status: "failed",
                error: errorMsg,
                userId: args.userId,
            });
            throw e;
        }

        if (!html) {
            const errorMsg = `Failed to render template: ${args.template}`;
            await ctx.runMutation(internal.email.send.logEmail, {
                to: toAddress,
                subject: args.subject,
                template: args.template,
                status: "failed",
                error: errorMsg,
                userId: args.userId,
            });
            throw new Error(errorMsg);
        }

        try {
            console.log(`Sending email to ${toAddress} from ${fromAddress}`);

            // Call the Resend Component to dispatch the email
            // @ts-ignore - Suppress deep type instantiation error and ensure access to lib
            const emailId = await ctx.runMutation(components.resend.lib.sendEmail, {
                options: {
                    apiKey,
                    retryAttempts: 3,
                    initialBackoffMs: 1000,
                    testMode: false, // Always try to send. Use Resend dashboard to see test mode emails if API key is test.
                },
                from: fromAddress,
                to: Array.isArray(args.to) ? args.to : [args.to],
                subject: args.subject,
                html: html,
                text: text,
            });

            // Log success (Queued)
            await ctx.runMutation(internal.email.send.logEmail, {
                to: toAddress,
                subject: args.subject,
                template: args.template,
                status: "sent",
                messageId: emailId as string,
                userId: args.userId,
            });

        } catch (e: any) {
            console.error("Failed to send email via component:", e);
            await ctx.runMutation(internal.email.send.logEmail, {
                to: toAddress,
                subject: args.subject,
                template: args.template,
                status: "failed",
                error: e.message || "Unknown component error",
                userId: args.userId,
            });
            throw e;
        }
    },
});
