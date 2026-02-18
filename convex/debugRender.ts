import { internalAction } from "./_generated/server";
import { renderTemplate } from "./email/templates";

export const testRender = internalAction({
    handler: async () => {
        try {
            console.log("Attempting to render 'welcome' template...");
            const result = renderTemplate("welcome", { firstName: "DebugUser" });
            return {
                success: true,
                htmlLength: result.html?.length,
                textPreview: result.text?.substring(0, 50)
            };
        } catch (e: any) {
            return {
                success: false,
                error: e.message,
                stack: e.stack
            };
        }
    },
});
