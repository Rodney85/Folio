import { internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

export const diagnose = internalMutation({
    handler: async (ctx) => {
        const report: any = {};

        // 1. Check Config
        const apiKey = process.env.RESEND_API_KEY;
        const fromEmail = process.env.RESEND_FROM_EMAIL;
        report.config = {
            hasApiKey: !!apiKey,
            fromEmail: fromEmail || "MISSING",
        };

        // 2. Check Users
        const users = await ctx.db.query("users").take(5);
        report.usersFound = users.length;
        report.firstUser = users[0] ? { id: users[0]._id, email: users[0].email, token: users[0].tokenIdentifier } : null;

        // 3. Check Logs
        const emails = await ctx.db.query("sent_emails").order("desc").take(5);
        report.lastEmails = emails;

        // 4. Test Trigger (if user exists)
        try {
            await ctx.db.insert("sent_emails", {
                to: "debug@test.com",
                subject: "Manual Debug Log",
                template: "debug",
                status: "sent",
                createdAt: Date.now(),
            });
            report.manualLogTest = "Success";
        } catch (e: any) {
            report.manualLogTest = "Failed: " + e.message;
        }

        if (users[0] && users[0].tokenIdentifier) {
            try {
                // Log manually to console to ensure we reach here
                console.log("Attempting to trigger notification...");

                await ctx.scheduler.runAfter(0, internal.notifications.triggerNotification, {
                    userId: users[0].tokenIdentifier,
                    type: "welcome",
                    data: { firstName: "Debug User" }
                });
                report.triggerTest = "Scheduled for " + users[0].email;
            } catch (e: any) {
                report.triggerTest = "Failed: " + e.message;
            }
        } else {
            report.triggerTest = "No valid user to test with";
        }

        return report;
    },
});
