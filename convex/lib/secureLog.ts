/**
 * Secure Logging Utility
 *
 * Utility functions to safely log information without exposing PII
 * in production environments.
 */

/**
 * Redact an email address for logging
 * @param email - The email to redact
 * @returns Redacted email like "us***@example.com"
 */
export function redactEmail(email: string): string {
    if (!email || typeof email !== 'string') return '***';

    const [username, domain] = email.split('@');
    if (!domain) return '***@***';

    // Show first character, redact the rest
    const redactedUsername = username.length > 1
        ? `${username[0]}${'*'.repeat(Math.min(username.length - 1, 5))}`
        : '*';

    return `${redactedUsername}@${domain}`;
}

/**
 * Redact a name for logging
 * @param name - The name to redact
 * @returns Redacted name like "J*** Doe" or just initials
 */
export function redactName(name: string): string {
    if (!name || typeof name !== 'string') return '***';

    const parts = name.trim().split(' ');
    if (parts.length === 0) return '***';

    if (parts.length === 1) {
        // Single name: show first letter
        return `${parts[0][0]}***`;
    }

    // Multiple parts: show first letter of first name, redact rest
    const firstInitial = parts[0][0];
    const lastName = parts[parts.length - 1];
    const redactedLastName = lastName.length > 1
        ? `${lastName[0]}${'*'.repeat(Math.min(lastName.length - 1, 3))}`
        : '*';

    return `${firstInitial}. ${redactedLastName}`;
}

/**
 * Redact a user identifier (tokenIdentifier, userId, etc.)
 * @param identifier - The identifier to redact
 * @returns Last 4-6 characters or hashed version
 */
export function redactUserId(identifier: string): string {
    if (!identifier || typeof identifier !== 'string') return '***';

    // Extract the user ID part after the pipe if it's a tokenIdentifier
    const parts = identifier.split('|');
    const userId = parts[parts.length - 1];

    if (userId.length <= 6) {
        return `***${userId}`;
    }

    return `...${userId.slice(-6)}`;
}

/**
 * Create a debug log that is automatically redacted in production
 * @param message - The log message (can include {email}, {name}, {userId} placeholders)
 * @param data - Data object with sensitive fields
 */
export function secureLog(message: string, data?: Record<string, any>): void {
    // In production, reduce log verbosity
    const isProduction = typeof window !== 'undefined'
        ? window.location.hostname !== 'localhost'
        : process.env.NODE_ENV === 'production';

    if (isProduction) {
        // Minimal logging in production - only non-sensitive summaries
        if (data) {
            const redacted: Record<string, any> = {};
            Object.keys(data).forEach(key => {
                const value = data[key];
                if (key.toLowerCase().includes('email')) {
                    redacted[key] = redactEmail(value);
                } else if (key.toLowerCase().includes('name')) {
                    redacted[key] = redactName(value);
                } else if (key.toLowerCase().includes('user') || key.toLowerCase().includes('id')) {
                    redacted[key] = redactUserId(String(value));
                } else {
                    redacted[key] = value;
                }
            });
            console.log(message, redacted);
        } else {
            console.log(message);
        }
    } else {
        // Full logging in development
        console.log(message, data || '');
    }
}

/**
 * Secure error logger that redacts sensitive information
 */
export function secureError(error: Error | string, context?: Record<string, any>): void {
    const isProduction = typeof window !== 'undefined'
        ? window.location.hostname !== 'localhost'
        : process.env.NODE_ENV === 'production';

    if (isProduction) {
        // In production, log error without sensitive context
        console.error(`[ERROR] ${error}`);
    } else {
        // In development, include full context
        console.error(`[ERROR] ${error}`, context || '');
    }
}
