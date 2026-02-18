import { internalAction } from "./_generated/server";
import { renderToStaticMarkup } from "react-dom/server";
import React from "react";

export const testNative = internalAction({
    handler: async () => {
        try {
            console.log("Attempting native render...");
            const element = React.createElement("div", null, "Hello World");
            const html = renderToStaticMarkup(element);
            return {
                success: true,
                html: html
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
