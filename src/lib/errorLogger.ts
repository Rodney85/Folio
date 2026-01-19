/**
 * Error Logging Utility
 * Centralized error handling for production monitoring
 * 
 * To enable Sentry (recommended for production):
 * 1. npm install @sentry/react
 * 2. Set VITE_SENTRY_DSN in your .env
 * 3. Uncomment Sentry initialization in main.tsx
 */

export interface ErrorContext {
    userId?: string;
    component?: string;
    action?: string;
    metadata?: Record<string, unknown>;
}

/**
 * Log an error with context information
 * In production, this would send to Sentry/other monitoring service
 */
export function logError(error: Error, context?: ErrorContext): void {
    const errorData = {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        ...context,
    };

    // In development, log to console
    if (import.meta.env.DEV) {
        console.error('[Error Logger]', errorData);
        return;
    }

    // In production, send to monitoring service
    // Uncomment when Sentry is configured:
    // if (typeof Sentry !== 'undefined') {
    //   Sentry.captureException(error, {
    //     extra: context,
    //   });
    // }

    // Fallback: Log structured error for server logs (Netlify/Vercel)
    console.error(JSON.stringify({
        type: 'error',
        ...errorData,
    }));
}

/**
 * Log a security-related event
 */
export function logSecurityEvent(
    event: 'auth_failure' | 'unauthorized_access' | 'rate_limited' | 'suspicious_activity',
    details: Record<string, unknown>
): void {
    const eventData = {
        type: 'security',
        event,
        timestamp: new Date().toISOString(),
        ...details,
    };

    if (import.meta.env.DEV) {
        console.warn('[Security Event]', eventData);
        return;
    }

    // In production, log for analysis
    console.warn(JSON.stringify(eventData));
}

/**
 * Create a wrapped async function that catches and logs errors
 */
export function withErrorLogging<T extends (...args: unknown[]) => Promise<unknown>>(
    fn: T,
    context?: ErrorContext
): T {
    return (async (...args: unknown[]) => {
        try {
            return await fn(...args);
        } catch (error) {
            logError(error instanceof Error ? error : new Error(String(error)), context);
            throw error;
        }
    }) as T;
}
