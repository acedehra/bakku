import { KVEntry } from "../types";

/**
 * Validation result interface

/**
 * Validation result interface
 */
export interface ValidationResult {
    isValid: boolean;
    error?: string;
}

/**
 * Validate URL format
 */
export function validateUrl(url: string): ValidationResult {
    if (!url || !url.trim()) {
        return { isValid: false, error: "URL cannot be empty" };
    }

    const trimmedUrl = url.trim();

    // Check if URL has a protocol
    const hasProtocol = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmedUrl);
    if (!hasProtocol) {
        return {
            isValid: false,
            error: "URL must include a protocol (e.g., https://)",
        };
    }

    // Try to parse URL
    try {
        const parsedUrl = new URL(trimmedUrl);

        // Check if protocol is HTTP or HTTPS
        if (
            !["http:", "https:", "ws:", "wss:"].includes(parsedUrl.protocol)
        ) {
            return {
                isValid: false,
                error: "Only HTTP, HTTPS, WS, and WSS protocols are supported",
            };
        }

        // Check if hostname is valid
        if (!parsedUrl.hostname) {
            return { isValid: false, error: "URL must include a valid hostname" };
        }

        return { isValid: true };
    } catch (error) {
        return {
            isValid: false,
            error: "Invalid URL format",
        };
    }
}

/**
 * Validate header name
 */
export function validateHeaderName(name: string): ValidationResult {
    if (!name || !name.trim()) {
        return { isValid: false, error: "Header name cannot be empty" };
    }

    const trimmedName = name.trim();

    // Header names should be ASCII
    if (!/^[\x00-\x7F]*$/.test(trimmedName)) {
        return {
            isValid: false,
            error: "Header names must contain only ASCII characters",
        };
    }

    // Check for invalid characters
    if (/[()<>@,;:"\/\[\]?={}\x00-\x1F]/.test(trimmedName)) {
        return {
            isValid: false,
            error: "Header name contains invalid characters",
        };
    }

    // Header names are case-insensitive but conventionally use Pascal-Case
    // We don't enforce this but it's a good practice

    return { isValid: true };
}

/**
 * Validate header value
 */
export function validateHeaderValue(value: string): ValidationResult {
    // Header values can be empty
    if (!value) {
        return { isValid: true };
    }

    const trimmedValue = value.trim();

    // Header values should be ASCII or UTF-8
    // We'll allow most characters but warn about control characters
    if (/[\x00-\x1F\x7F]/.test(trimmedValue)) {
        return {
            isValid: false,
            error: "Header values cannot contain control characters",
        };
    }

    return { isValid: true };
}

/**
 * Validate all headers
 */
export function validateHeaders(
    headers: KVEntry[]
): ValidationResult {
    const errors: string[] = [];

    for (const header of headers) {
        if (!header.enabled || !header.key) continue;

        const nameResult = validateHeaderName(header.key);
        if (!nameResult.isValid) {
            errors.push(`Header "${header.key}": ${nameResult.error}`);
        }

        const valueResult = validateHeaderValue(header.value);
        if (!valueResult.isValid) {
            errors.push(`Header "${header.key}" value: ${valueResult.error}`);
        }
    }

    if (errors.length > 0) {
        return { isValid: false, error: errors.join("; ") };
    }

    return { isValid: true };
}

/**
 * Validate Basic Auth configuration
 */
export function validateBasicAuth(
    username: string,
    password: string
): ValidationResult {
    if (!username || !username.trim()) {
        return { isValid: false, error: "Username is required for Basic Auth" };
    }

    // Username validation - check for excessive length
    if (username.length > 1024) {
        return {
            isValid: false,
            error: "Username is too long (max 1024 characters)",
        };
    }

    // Password validation
    if (password && password.length > 8192) {
        return {
            isValid: false,
            error: "Password is too long (max 8192 characters)",
        };
    }

    return { isValid: true };
}

/**
 * Validate Bearer Auth configuration
 */
export function validateBearerAuth(token: string): ValidationResult {
    if (!token || !token.trim()) {
        return { isValid: false, error: "Token is required for Bearer Auth" };
    }

    // Token validation - check for excessive length
    if (token.length > 8192) {
        return {
            isValid: false,
            error: "Token is too long (max 8192 characters)",
        };
    }

    return { isValid: true };
}

/**
 * Validate Custom Auth configuration
 */
export function validateCustomAuth(
    headerName: string,
    headerValue: string
): ValidationResult {
    const nameResult = validateHeaderName(headerName);
    if (!nameResult.isValid) {
        return nameResult;
    }

    const valueResult = validateHeaderValue(headerValue);
    if (!valueResult.isValid) {
        return valueResult;
    }

    return { isValid: true };
}

/**
 * Validate Auth configuration based on type
 */
export function validateAuth(authConfig: {
    type: string;
    username?: string;
    password?: string;
    token?: string;
    headerName?: string;
    headerValue?: string;
}): ValidationResult {
    switch (authConfig.type) {
        case "Basic":
            return validateBasicAuth(authConfig.username || "", authConfig.password || "");

        case "Bearer":
            return validateBearerAuth(authConfig.token || "");

        case "Custom":
            return validateCustomAuth(
                authConfig.headerName || "",
                authConfig.headerValue || ""
            );

        case "None":
            return { isValid: true };

        default:
            return { isValid: false, error: "Invalid auth type" };
    }
}

/**
 * Validate request body based on content type
 */
export function validateRequestBody(
    body: string,
    contentType?: string
): ValidationResult {
    // Empty body is valid
    if (!body) {
        return { isValid: true };
    }

    // Check body size limit
    const MAX_BODY_SIZE = 10 * 1024 * 1024; // 10 MB
    if (body.length > MAX_BODY_SIZE) {
        return {
            isValid: false,
            error: `Request body is too large (max ${MAX_BODY_SIZE / 1024 / 1024} MB)`,
        };
    }

    // Validate JSON body if content type is JSON
    if (
        contentType?.includes("application/json") ||
        contentType?.includes("application/vnd.api+json")
    ) {
        try {
            JSON.parse(body);
        } catch (error) {
            return {
                isValid: false,
                error: "Invalid JSON in request body",
            };
        }
    }

    return { isValid: true };
}

/**
 * Validate URL parameter key
 */
export function validateParamKey(key: string): ValidationResult {
    if (!key || !key.trim()) {
        return { isValid: false, error: "Parameter key cannot be empty" };
    }

    const trimmedKey = key.trim();

    // Check for excessive length
    if (trimmedKey.length > 1024) {
        return {
            isValid: false,
            error: "Parameter key is too long (max 1024 characters)",
        };
    }

    return { isValid: true };
}

/**
 * Validate URL parameter value
 */
export function validateParamValue(value: string): ValidationResult {
    // Empty values are allowed
    if (!value) {
        return { isValid: true };
    }

    // Check for excessive length
    if (value.length > 4096) {
        return {
            isValid: false,
            error: "Parameter value is too long (max 4096 characters)",
        };
    }

    return { isValid: true };
}

/**
 * Validate all URL parameters
 */
export function validateParams(
    params: KVEntry[]
): ValidationResult {
    const errors: string[] = [];

    for (const entry of params) {
        if (!entry.enabled || !entry.key) continue;

        const keyResult = validateParamKey(entry.key);
        if (!keyResult.isValid) {
            errors.push(`Parameter "${entry.key}": ${keyResult.error}`);
        }

        const valueResult = validateParamValue(entry.value);
        if (!valueResult.isValid) {
            errors.push(`Parameter "${entry.key}" value: ${valueResult.error}`);
        }
    }

    if (errors.length > 0) {
        return { isValid: false, error: errors.join("; ") };
    }

    return { isValid: true };
}

/**
 * Validate environment variable key
 */
export function validateVariableKey(key: string): ValidationResult {
    if (!key || !key.trim()) {
        return { isValid: false, error: "Variable key cannot be empty" };
    }

    const trimmedKey = key.trim();

    // Check for variable syntax in key itself
    if (trimmedKey.includes("{{") || trimmedKey.includes("}}")) {
        return {
            isValid: false,
            error: "Variable key cannot contain {{ or }}",
        };
    }

    // Check for excessive length
    if (trimmedKey.length > 256) {
        return {
            isValid: false,
            error: "Variable key is too long (max 256 characters)",
        };
    }

    return { isValid: true };
}

/**
 * Validate environment variable value
 */
export function validateVariableValue(value: string): ValidationResult {
    // Empty values are allowed
    if (!value) {
        return { isValid: true };
    }

    // Check for excessive length
    if (value.length > 8192) {
        return {
            isValid: false,
            error: "Variable value is too long (max 8192 characters)",
        };
    }

    return { isValid: true };
}

/**
 * Validate environment configuration
 */
export function validateEnvironment(env: {
    id: string;
    name: string;
    variables: Array<{ key: string; value: string; enabled: boolean }>;
}): ValidationResult {
    if (!env.name || !env.name.trim()) {
        return { isValid: false, error: "Environment name cannot be empty" };
    }

    if (env.name.length > 100) {
        return {
            isValid: false,
            error: "Environment name is too long (max 100 characters)",
        };
    }

    for (const variable of env.variables) {
        if (!variable.enabled) continue;

        const keyResult = validateVariableKey(variable.key);
        if (!keyResult.isValid) {
            return keyResult;
        }

        const valueResult = validateVariableValue(variable.value);
        if (!valueResult.isValid) {
            return valueResult;
        }
    }

    return { isValid: true };
}
