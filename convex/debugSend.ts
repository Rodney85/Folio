import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

export const testSend = internalAction({
    handler: async (ctx) => {
        console.log("Testing direct send action call...");
        try {
            await ctx.runAction(internal.email.send.send, {
                to: "debug@test.com",
                subject: "Direct Send Test",
                template: "welcome",
                templateArgs: { firstName: "Debug" },
                // Note: passing userId is optional, skipping for now
                from: "CarFolio Debug <support@carfolio.cc>"
            });
            return "Direct send call succeeded (check logs for delivery status)";
        } catch (e: any) {
            return "Direct send call FAILED: " + e.message;
        }
    },
});
