/**
 * Input sanitization utilities for user-provided content
 * Prevents XSS, injection attacks, and ensures data quality
 */

/**
 * Maximum lengths for different field types
 */
export const MAX_LENGTHS = {
    username: 30,
    bio: 500,
    description: 2000,
    carField: 100,
    url: 500,
    partName: 100,
    partDescription: 500,
} as const;

/**
 * Sanitize a text string by trimming, limiting length, and removing potentially dangerous content
 * @param input - The input string to sanitize
 * @param maxLength - Maximum allowed length (default: 1000)
 * @returns Sanitized string or undefined if input was undefined/null
 */
export function sanitizeText(
    input: string | undefined | null,
    maxLength: number = 1000
): string | undefined {
    if (input === undefined || input === null) return undefined;
    if (typeof input !== "string") return undefined;

    return input
        .trim()
        .slice(0, maxLength)
        // Remove null bytes
        .replace(/\0/g, "")
        // Remove HTML tags (basic XSS prevention)
        .replace(/<[^>]*>/g, "")
        // Remove script-like patterns
        .replace(/javascript:/gi, "")
        .replace(/on\w+=/gi, "");
}

/**
 * Sanitize a username - alphanumeric, underscores, and dots only
 * @param input - The username to sanitize
 * @returns Sanitized username or undefined
 */
export function sanitizeUsername(input: string | undefined | null): string | undefined {
    if (input === undefined || input === null) return undefined;
    if (typeof input !== "string") return undefined;

    const sanitized = input
        .trim()
        .toLowerCase()
        .slice(0, MAX_LENGTHS.username)
        // Only allow alphanumeric, underscores, and dots
        .replace(/[^a-z0-9_.]/g, "");

    // Ensure it doesn't start or end with a dot or underscore
    return sanitized.replace(/^[._]+|[._]+$/g, "");
}

/**
 * Sanitize a URL - ensure it's a valid http/https URL
 * @param input - The URL to sanitize
 * @returns Sanitized URL or undefined if invalid
 */
export function sanitizeUrl(input: string | undefined | null): string | undefined {
    if (input === undefined || input === null) return undefined;
    if (typeof input !== "string") return undefined;

    const trimmed = input.trim().slice(0, MAX_LENGTHS.url);

    // Empty string is valid (treated as no URL)
    if (trimmed === "") return "";

    // Must start with http:// or https://
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
        // Try to add https:// if it looks like a URL
        if (trimmed.includes(".") && !trimmed.includes(" ")) {
            return `https://${trimmed}`;
        }
        return undefined;
    }

    // Basic URL validation
    try {
        const url = new URL(trimmed);
        // Only allow http and https protocols
        if (url.protocol !== "http:" && url.protocol !== "https:") {
            return undefined;
        }
        return url.toString();
    } catch {
        return undefined;
    }
}

/**
 * Sanitize a social media handle (remove @ prefix if present)
 * @param input - The social handle to sanitize
 * @returns Sanitized handle or undefined
 */
export function sanitizeSocialHandle(input: string | undefined | null): string | undefined {
    if (input === undefined || input === null) return undefined;
    if (typeof input !== "string") return undefined;

    const trimmed = input.trim();

    // Empty string is valid
    if (trimmed === "") return "";

    // Remove @ prefix and sanitize
    return trimmed
        .replace(/^@/, "")
        .slice(0, 50)
        // Remove potentially dangerous characters but allow typical social media handle chars
        .replace(/[<>'"]/g, "");
}

/**
 * Sanitize a number field - ensure it's a valid number within range
 * @param input - The number to validate
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns Validated number or undefined if invalid
 */
export function sanitizeNumber(
    input: number | string | undefined | null,
    min: number = 0,
    max: number = Number.MAX_SAFE_INTEGER
): number | undefined {
    if (input === undefined || input === null) return undefined;

    const num = typeof input === "string" ? parseInt(input, 10) : input;

    if (typeof num !== "number" || isNaN(num)) return undefined;

    return Math.max(min, Math.min(max, num));
}

/**
 * Validate file content type
 * @param contentType - The MIME type to validate
 * @param allowedTypes - Array of allowed MIME types
 * @returns true if valid, false otherwise
 */
export function isValidFileType(
    contentType: string,
    allowedTypes: string[] = ["image/jpeg", "image/png", "image/webp", "image/gif"]
): boolean {
    return allowedTypes.includes(contentType.toLowerCase());
}

/**
 * Get file extension from content type
 * @param contentType - The MIME type
 * @returns File extension or 'bin' if unknown
 */
export function getFileExtension(contentType: string): string {
    const extensions: Record<string, string> = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
        "image/gif": "gif",
    };
    return extensions[contentType.toLowerCase()] || "bin";
}
