/**
 * Request Cache System
 *
 * Provides in-memory caching for HTTP GET requests with TTL support.
 */

import { cacheConfig } from "../config";

/**
 * Cache entry interface
 */
interface CacheEntry<T> {
    key: string;
    value: T;
    timestamp: number;
    ttl: number;
}

/**
 * Cache options
 */
export interface CacheOptions {
    ttl?: number; // Time to live in milliseconds
    enabled?: boolean; // Whether caching is enabled
    headers?: Record<string, string>; // Optional headers to include in cache key
}

/**
 * Request Cache class
 */
export class RequestCache<T = unknown> {
    private cache: Map<string, CacheEntry<T>>;
    private defaultTtl: number;
    private enabled: boolean;

    constructor(defaultTtl: number = cacheConfig.ttlMs, enabled: boolean = cacheConfig.requestCaching) {
        this.cache = new Map();
        this.defaultTtl = defaultTtl;
        this.enabled = enabled;
    }

    /**
     * Generate cache key from URL and optional data
     */
    private generateKey(url: string, options?: CacheOptions): string {
        let key = url;
        if (options?.headers) {
            const headersString = JSON.stringify(options.headers);
            key += `:${headersString}`;
        }
        return key;
    }

    /**
     * Check if cache entry is expired
     */
    private isExpired(entry: CacheEntry<T>): boolean {
        const now = Date.now();
        return now - entry.timestamp > entry.ttl;
    }

    /**
     * Clean up expired entries
     */
    private cleanup(): void {
        const keysToDelete: string[] = [];

        for (const [key, entry] of this.cache.entries()) {
            if (this.isExpired(entry)) {
                keysToDelete.push(key);
            }
        }

        keysToDelete.forEach((key) => this.cache.delete(key));
    }

    /**
     * Set a value in cache
     */
    set(key: string, value: T, options?: CacheOptions): void {
        if (!this.enabled) return;

        this.cleanup();

        const entry: CacheEntry<T> = {
            key,
            value,
            timestamp: Date.now(),
            ttl: options?.ttl ?? this.defaultTtl,
        };

        this.cache.set(key, entry);
    }

    /**
     * Get a value from cache
     */
    get(key: string, options?: CacheOptions): T | null {
        if (!this.enabled) return null;

        this.cleanup();

        const entry = this.cache.get(key);

        if (!entry) {
            return null;
        }

        if (this.isExpired(entry)) {
            this.cache.delete(key);
            return null;
        }

        // Update TTL if custom TTL provided
        if (options?.ttl !== undefined) {
            entry.ttl = options.ttl;
        }

        return entry.value;
    }

    /**
     * Check if a key exists in cache and is not expired
     */
    has(key: string): boolean {
        if (!this.enabled) return false;

        const entry = this.cache.get(key);
        if (!entry) return false;

        if (this.isExpired(entry)) {
            this.cache.delete(key);
            return false;
        }

        return true;
    }

    /**
     * Delete a specific key from cache
     */
    delete(key: string): boolean {
        return this.cache.delete(key);
    }

    /**
     * Clear all entries from cache
     */
    clear(): void {
        this.cache.clear();
    }

    /**
     * Get cache statistics
     */
    getStats(): { size: number; keys: string[] } {
        this.cleanup();

        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys()),
        };
    }

    /**
     * Enable or disable caching
     */
    setEnabled(enabled: boolean): void {
        this.enabled = enabled;
        if (!enabled) {
            this.clear();
        }
    }

    /**
     * Set default TTL
     */
    setDefaultTtl(ttl: number): void {
        this.defaultTtl = ttl;
    }
}

/**
 * Default cache instance for HTTP requests
 */
const defaultCache = new RequestCache();

/**
 * Get or create a cached value
 */
export async function getCachedValue<T>(
    key: string,
    fetcher: () => Promise<T>,
    options?: CacheOptions
): Promise<T> {
    const cached = defaultCache.get(key, options) as T | null;

    if (cached !== null) {
        return cached;
    }

    const value = await fetcher();
    defaultCache.set(key, value, options);

    return value;
}

/**
 * Cache a request with URL and headers
 */
export function cacheRequest(
    url: string,
    value: unknown,
    options?: CacheOptions & { headers?: Record<string, string> }
): void {
    const key = defaultCache["generateKey"]?.(url, options) ?? url;
    defaultCache.set(key, value, options);
}

/**
 * Get cached request
 */
export function getCachedRequest<T>(
    url: string,
    options?: CacheOptions & { headers?: Record<string, string> }
): T | null {
    const key = defaultCache["generateKey"]?.(url, options) ?? url;
    return defaultCache.get(key, options) as T | null;
}

/**
 * Invalidate cache for a specific URL
 */
export function invalidateCache(url: string): void {
    const stats = defaultCache.getStats();
    stats.keys
        .filter((key) => key.startsWith(url))
        .forEach((key) => defaultCache.delete(key));
}

/**
 * Clear all cached requests
 */
export function clearCache(): void {
    defaultCache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { size: number; keys: string[] } {
    return defaultCache.getStats();
}

/**
 * Enable or disable request caching
 */
export function setCacheEnabled(enabled: boolean): void {
    defaultCache.setEnabled(enabled);
}
