import { fetch as tauriFetch } from "@tauri-apps/plugin-http";
import { AuthConfig, HttpMethod, ResponseData, Environment, KVEntry } from "../types";
import { createLogger } from "./logger";
import { getCachedRequest, cacheRequest } from "./requestCache";
import { trackRequest, completeRequest } from "./performance";
import { requestConfig } from "../config";

const logger = createLogger({ module: "httpClient" });

/**
 * Status codes that should trigger a retry
 */
const RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504];

/**
 * Check if an error is retryable
 */
function isRetryableError(error: unknown): boolean {
    if (error instanceof Error) {
        const message = error.message.toLowerCase();

        // Network errors
        if (
            message.includes("network error") ||
            message.includes("econnrefused") ||
            message.includes("enotfound") ||
            message.includes("etimedout") ||
            message.includes("timeout") ||
            message.includes("connection reset") ||
            message.includes("connection refused")
        ) {
            return true;
        }
    }
    return false;
}

/**
 * Calculate delay with exponential backoff
 */
function calculateRetryDelay(attempt: number, baseDelay: number = requestConfig.retryDelayMs): number {
    const maxDelay = 30000; // 30 seconds max delay
    const delay = baseDelay * Math.pow(requestConfig.retryBackoffMultiplier, attempt - 1);
    return Math.min(delay, maxDelay);
}

/**
 * Sleep for a specified duration
 */
function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Execute HTTP request with retry logic
 */
async function executeWithRetry<T>(
    fn: () => Promise<T>,
    shouldRetry: (result: T) => boolean,
    maxRetries: number = requestConfig.maxRetries
): Promise<T> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
        try {
            const result = await fn();

            // Check if we should retry based on result
            if (attempt <= maxRetries && shouldRetry(result)) {
                const delay = calculateRetryDelay(attempt);
                logger.warn(`Retrying request (attempt ${attempt}/${maxRetries})`, {
                    delayMs: delay,
                });
                await sleep(delay);
                continue;
            }

            return result;
        } catch (error) {
            lastError = error;

            // Check if we should retry based on error
            if (attempt <= maxRetries && isRetryableError(error)) {
                const delay = calculateRetryDelay(attempt);
                logger.warn(`Retrying request due to error (attempt ${attempt}/${maxRetries})`, {
                    error: error instanceof Error ? error.message : String(error),
                    delayMs: delay,
                });
                await sleep(delay);
                continue;
            }

            // Not retryable, throw immediately
            throw error;
        }
    }

    // All retries exhausted
    throw lastError;
}

function sanitizeVariableValue(value: string): string {
    return value.replace(/[<>]/g, '');
}

export const substituteVariables = (
    text: string,
    environment: Environment | null
): string => {
    if (!environment || !text) return text;

    let result = text;
    environment.variables.forEach((v) => {
        if (v.enabled && v.key) {
            // Escape special regex characters in the key
            const escapedKey = v.key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`{{${escapedKey}}}`, "g");
            result = result.replace(regex, sanitizeVariableValue(v.value));
        }
    });
    return result;
};

export const buildAuthHeaders = (authConfig: AuthConfig, activeEnv: Environment | null = null): [string, string][] => {
    const authHeaders: [string, string][] = [];
    if (authConfig.type === "Basic" && authConfig.username && authConfig.password) {
        const substitutedUsername = substituteVariables(authConfig.username, activeEnv);
        const substitutedPassword = substituteVariables(authConfig.password, activeEnv);
        const credentials = btoa(`${encodeURIComponent(substitutedUsername)}:${encodeURIComponent(substitutedPassword)}`);
        authHeaders.push(["Authorization", `Basic ${credentials}`]);
    } else if (authConfig.type === "Bearer" && authConfig.token) {
        const substitutedToken = substituteVariables(authConfig.token, activeEnv);
        authHeaders.push(["Authorization", `Bearer ${substitutedToken}`]);
    } else if (
        authConfig.type === "Custom" &&
        authConfig.headerName &&
        authConfig.headerValue
    ) {
        const substitutedHeaderName = substituteVariables(authConfig.headerName, activeEnv);
        const substitutedHeaderValue = substituteVariables(authConfig.headerValue, activeEnv);
        authHeaders.push([substitutedHeaderName, substitutedHeaderValue]);
    }
    return authHeaders;
};

export async function executeHttpRequest(
    method: HttpMethod,
    url: string,
    headers: KVEntry[],
    body: string,
    auth: AuthConfig,
    activeEnv: Environment | null = null
): Promise<ResponseData> {
    // Start performance tracking
    const endTracking = trackRequest(url, method);
    const startTime = performance.now();

    const substitutedUrl = substituteVariables(url, activeEnv);
    const substitutedBody = substituteVariables(body, activeEnv);

    // Validate URL format before making the request
    try {
        new URL(substitutedUrl);
    } catch {
        logger.error("Invalid URL format", undefined, { url: substitutedUrl });
        throw new Error("Invalid URL format. Please enter a valid URL (e.g., https://example.com)");
    }

    const finalHeaders: [string, string][] = [];
    for (const h of headers) {
        if (!h.enabled || !h.key) continue;
        finalHeaders.push([substituteVariables(h.key, activeEnv), substituteVariables(h.value, activeEnv)]);
    }

    const authHeaders = buildAuthHeaders(auth, activeEnv);
    const allHeaders = [...finalHeaders, ...authHeaders];

    const options: {
        method: string;
        headers?: [string, string][];
        body?: string;
    } = { method };

    if (allHeaders.length > 0) {
        options.headers = allHeaders;
    }

    const canHaveBody = method !== "GET" && method !== "HEAD";
    if (canHaveBody && substitutedBody.trim()) {
        options.body = substitutedBody;
        if (!options.headers) {
            options.headers = [];
        }
        if (!options.headers.some(([k]) => k.toLowerCase() === "content-type")) {
            options.headers.push(["Content-Type", "application/json"]);
        }
    }

    // Log request
    logger.logRequest({
        method,
        url: substitutedUrl,
        headers: allHeaders,
        body: options.body,
    });

    // Check cache for GET requests
    if (method === "GET") {
        const cached = getCachedRequest<ResponseData>(substitutedUrl, {
            headers: allHeaders,
        });
        if (cached) {
            logger.info("Cache hit", { url: substitutedUrl });
            endTracking();
            completeRequest(substitutedUrl, method, cached.status ?? 200, cached.size ?? 0, true);
            return cached;
        }
    }

    // Execute request with retry logic
    const res = await executeWithRetry(
        async () => tauriFetch(substitutedUrl, options),
        (response) => RETRYABLE_STATUS_CODES.includes(response.status)
    );

    const endTime = performance.now();
    const timing = endTime - startTime;

    const contentType = res.headers.get("content-type") ?? "";
    const text = await res.text();
    const responseSize = new Blob([text]).size;

    // Convert response headers to object
    const responseHeaders: Record<string, string> = {};
    res.headers.forEach((value, key) => {
        responseHeaders[key] = value;
    });

    // Format response body
    let formattedBody = text;
    if (contentType.includes("application/json")) {
        try {
            const json = text ? JSON.parse(text) : null;
            formattedBody =
                json !== null ? JSON.stringify(json, null, 2) : "(empty JSON)";
        } catch {
            formattedBody = text || "(empty response)";
        }
    } else {
        formattedBody = text || "(empty response)";
    }

    // Log response
    logger.logResponse({
        status: res.status,
        statusText: res.statusText,
        headers: responseHeaders,
        timing,
        size: responseSize,
    });

    const responseData = {
        status: res.status,
        statusText: res.statusText,
        headers: responseHeaders,
        body: formattedBody,
        timing,
        size: responseSize,
    };

    // Cache successful GET responses
    if (method === "GET" && res.status >= 200 && res.status < 300) {
        cacheRequest(substitutedUrl, responseData, {
            headers: allHeaders,
        });
        logger.info("Cached response", { url: substitutedUrl, status: res.status });
    }

    // Complete performance tracking
    endTracking();
    completeRequest(substitutedUrl, method, res.status, responseSize, false);

    return responseData;
}

export function formatError(err: unknown): string {
    if (err instanceof Error) {
        const message = err.message.toLowerCase();

        // Check for DNS/domain resolution errors
        if (
            message.includes("failed to resolve") ||
            message.includes("name resolution") ||
            message.includes("dns") ||
            message.includes("not found") ||
            message.includes("no such host") ||
            message.includes("cannot resolve")
        ) {
            return `Domain not found: Unable to resolve the domain name. Please check if the URL is correct.`;
        }
        // Check for invalid URL errors
        else if (
            message.includes("invalid url") ||
            message.includes("invalid uri") ||
            message.includes("parse error")
        ) {
            return `Invalid URL: The URL format is incorrect. Please check the URL and try again.`;
        }
        // Check for connection errors
        else if (
            message.includes("connection") ||
            message.includes("timeout") ||
            message.includes("network")
        ) {
            return `Connection error: ${err.message}`;
        }
        // Check for SSL/TLS errors
        else if (
            message.includes("ssl") ||
            message.includes("tls") ||
            message.includes("certificate")
        ) {
            return `SSL/TLS error: ${err.message}`;
        }
        // Use the original error message if it's descriptive
        else if (err.message && err.message.trim() !== "") {
            return err.message;
        }
    } else if (typeof err === "string") {
        return err;
    }
    return "Unknown error";
}
