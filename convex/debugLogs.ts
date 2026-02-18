import { internalMutation } from "./_generated/server";

export const checkEmailLogs = internalMutation({
    handler: async (ctx) => {
        // Get the last email error
        const log = await ctx.db.query("sent_emails")
            .order("desc")
            .first();

        return log ? JSON.stringify(log, null, 2) : "No logs found";
    },
});
