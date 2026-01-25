// Check if URL has a protocol
export const hasProtocol = (url: string): boolean => {
    return /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(url);
};

// Extract base URL (without query params) from a full URL
export const getBaseUrl = (fullUrl: string): string => {
    if (!fullUrl.trim()) return fullUrl;

    // If URL has a protocol, use URL constructor
    if (hasProtocol(fullUrl)) {
        try {
            const urlObj = new URL(fullUrl);
            return `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
        } catch {
            // Fall through to manual extraction
        }
    }

    // Manual extraction for URLs without protocol or if URL constructor fails
    const queryIndex = fullUrl.indexOf('?');
    if (queryIndex !== -1) {
        return fullUrl.substring(0, queryIndex);
    }
    return fullUrl;
};

// Parse query params from URL (handles URLs with or without protocol)
export const parseUrlParams = (fullUrl: string): Record<string, string> => {
    if (!fullUrl.trim()) return {};

    // If URL has a protocol, try using URL constructor
    if (hasProtocol(fullUrl)) {
        try {
            const urlObj = new URL(fullUrl);
            const parsedParams: Record<string, string> = {};
            urlObj.searchParams.forEach((value, key) => {
                parsedParams[key] = value;
            });
            return parsedParams;
        } catch {
            // Fall through to manual parsing
        }
    }

    // Manual parsing for URLs without protocol or if URL constructor fails
    const queryIndex = fullUrl.indexOf('?');
    if (queryIndex === -1) return {};

    const queryString = fullUrl.substring(queryIndex + 1);
    const parsedParams: Record<string, string> = {};
    const pairs = queryString.split('&');

    for (const pair of pairs) {
        if (!pair) continue; // Skip empty pairs
        const equalIndex = pair.indexOf('=');
        if (equalIndex === -1) {
            // No equals sign, treat as key with empty value
            const key = pair;
            if (key) {
                try {
                    parsedParams[decodeURIComponent(key)] = '';
                } catch {
                    parsedParams[key] = '';
                }
            }
        } else {
            const key = pair.substring(0, equalIndex);
            const value = pair.substring(equalIndex + 1);
            if (key) {
                try {
                    const decodedKey = decodeURIComponent(key);
                    const decodedValue = value ? decodeURIComponent(value) : '';
                    parsedParams[decodedKey] = decodedValue;
                } catch {
                    // If decoding fails, use raw values
                    parsedParams[key] = value || '';
                }
            }
        }
    }

    return parsedParams;
};

// Build full URL with params
export const buildUrlWithParams = (baseUrl: string, queryParams: Record<string, string>): string => {
    if (Object.keys(queryParams).length === 0) return baseUrl;
    if (!baseUrl.trim()) return baseUrl;

    // If URL has a protocol, try using URL constructor
    if (hasProtocol(baseUrl)) {
        try {
            const urlObj = new URL(baseUrl);

            // Clear existing search params and add new ones
            urlObj.search = '';
            Object.entries(queryParams).forEach(([key, value]) => {
                if (key) {
                    // Allow empty values to preserve params while user is typing
                    urlObj.searchParams.set(key, value || '');
                }
            });

            return urlObj.toString();
        } catch {
            // Fall through to manual building
        }
    }

    // Manual building for URLs without protocol or if URL constructor fails
    const queryPairs: string[] = [];
    Object.entries(queryParams).forEach(([key, value]) => {
        if (key) {
            // Allow empty values
            queryPairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(value || '')}`);
        }
    });

    if (queryPairs.length === 0) return baseUrl;

    // Remove existing query params from baseUrl if any
    const baseWithoutQuery = baseUrl.split('?')[0];
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseWithoutQuery}${separator}${queryPairs.join('&')}`;
};
