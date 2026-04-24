import { KVEntry } from '../types';

// Check if URL has a protocol
export const hasProtocol = (url: string): boolean => {
    return /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(url);
};

// Extract base URL (without query params) from a full URL
export const getBaseUrl = (fullUrl: string): string => {
    if (!fullUrl.trim()) return fullUrl;

    if (hasProtocol(fullUrl)) {
        try {
            const urlObj = new URL(fullUrl);
            
            if (!urlObj.hostname) {
                return fullUrl;
            }

            let result = fullUrl;
            
            // If URL successfully parsed and identified a query string, strip exactly that string
            if (urlObj.search) {
                const searchIndex = fullUrl.indexOf(urlObj.search);
                if (searchIndex !== -1) {
                    result = fullUrl.substring(0, searchIndex) + fullUrl.substring(searchIndex + urlObj.search.length);
                }
            }
            return result;
        } catch {
            // Fall through to manual parsing for unrecognized protocols
        }
    }

    const queryIndex = fullUrl.indexOf('?');
    const hashIndex = fullUrl.indexOf('#');
    
    if (queryIndex !== -1) {
        if (hashIndex !== -1 && hashIndex < queryIndex) {
            return fullUrl;
        }

        let base = fullUrl.substring(0, queryIndex);
        if (hashIndex !== -1 && hashIndex > queryIndex) {
            base += fullUrl.substring(hashIndex);
        }
        return base;
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
    if (!baseUrl.trim()) return baseUrl;
    if (Object.keys(queryParams).length === 0) return baseUrl;

    const queryPairs: string[] = [];
    Object.entries(queryParams).forEach(([key, value]) => {
        if (key) {
            queryPairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(value || '')}`);
        }
    });

    if (queryPairs.length === 0) return baseUrl;

    const hashIndex = baseUrl.indexOf('#');
    let baseWithoutHash = baseUrl;
    let hash = '';
    
    if (hashIndex !== -1) {
        hash = baseUrl.substring(hashIndex);
        baseWithoutHash = baseUrl.substring(0, hashIndex);
    }

    const queryIndex = baseWithoutHash.indexOf('?');
    let baseWithoutQuery = baseWithoutHash;
    
    if (queryIndex !== -1) {
        baseWithoutQuery = baseWithoutHash.substring(0, queryIndex);
    }

    return `${baseWithoutQuery}?${queryPairs.join('&')}${hash}`;
};

/**
 * Parse query params from URL preserving order and allowing duplicates.
 */
export const parseUrlParamsOrdered = (fullUrl: string): KVEntry[] => {
    if (!fullUrl.trim()) return [];

    const queryIndex = fullUrl.indexOf('?');
    const queryString = queryIndex !== -1 ? fullUrl.substring(queryIndex + 1) : '';
    // Strip hash if present in queryString
    const hashInQuery = queryString.indexOf('#');
    const cleanQuery = hashInQuery !== -1 ? queryString.substring(0, hashInQuery) : queryString;
    
    const searchParams = new URLSearchParams(cleanQuery);

    const entries: KVEntry[] = [];
    searchParams.forEach((value, key) => {
        entries.push({
            id: crypto.randomUUID(),
            key,
            value,
            enabled: true
        });
    });

    return entries;
};

/**
 * Build full URL with ordered params, preserving duplicates and respecting the 'enabled' flag.
 */
export const buildUrlWithOrderedParams = (baseUrl: string, entries: KVEntry[]): string => {
    if (!baseUrl.trim()) return baseUrl;

    const searchParams = new URLSearchParams();
    entries.forEach(entry => {
        if (entry.enabled && entry.key) {
            searchParams.append(entry.key, entry.value || '');
        }
    });

    const queryString = searchParams.toString();
    
    const hashIndex = baseUrl.indexOf('#');
    let baseWithoutHash = baseUrl;
    let hash = '';
    
    if (hashIndex !== -1) {
        hash = baseUrl.substring(hashIndex);
        baseWithoutHash = baseUrl.substring(0, hashIndex);
    }

    const baseWithoutQuery = getBaseUrl(baseWithoutHash);
    
    if (!queryString) return `${baseWithoutQuery}${hash}`;
    return `${baseWithoutQuery}?${queryString}${hash}`;
};
