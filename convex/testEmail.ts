import { mutation } from "./_generated/server";
import { internal } from "./_generated/api";

export const test = mutation({
    handler: async (ctx) => {
        console.log("Starting test email trigger...");
        await ctx.scheduler.runAfter(0, internal.notifications.triggerNotification, {
            userId: "test-user-id",
            email: "rodneydev852@gmail.com",
            type: "welcome",
            data: {
                firstName: "TestUser",
                actionUrl: "https://carfolio.app"
            }
        });
        console.log("Scheduled notification!");
        return "Scheduled";
    },
});
