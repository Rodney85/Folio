import { query } from "./_generated/server";

export const list = query({
    handler: async (ctx) => {
        return await ctx.db.query("sent_emails").order("desc").take(10);
    },
});
