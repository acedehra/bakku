/**
 * Performance Monitoring System
 *
 * Provides performance tracking for HTTP requests and UI renders.
 */

import { featureFlags } from "../config";

/**
 * Performance metrics for a request
 */
export interface RequestMetrics {
    url: string;
    method: string;
    startTime: number;
    endTime: number;
    duration: number;
    status?: number;
    size?: number;
    cached?: boolean;
}

/**
 * Performance metrics for a render
 */
export interface RenderMetrics {
    component: string;
    startTime: number;
    endTime: number;
    duration: number;
}

/**
 * Performance statistics
 */
export interface PerformanceStats {
    totalRequests: number;
    totalDuration: number;
    averageDuration: number;
    minDuration: number;
    maxDuration: number;
    p50: number; // 50th percentile
    p90: number; // 90th percentile
    p95: number; // 95th percentile
    p99: number; // 99th percentile
    cacheHitRate: number;
}

/**
 * Performance Monitor class
 */
export class PerformanceMonitor {
    private requestMetrics: RequestMetrics[] = [];
    private renderMetrics: RenderMetrics[] = [];
    private enabled: boolean;

    constructor(enabled: boolean = featureFlags.performanceMonitoring) {
        this.enabled = enabled;
    }

    /**
     * Calculate percentile from sorted array
     */
    private calculatePercentile(sorted: number[], percentile: number): number {
        const index = Math.ceil((percentile / 100) * sorted.length) - 1;
        return sorted[Math.max(0, index)] ?? 0;
    }

    /**
     * Start tracking a request
     */
    startRequest(url: string, method: string): () => void {
        if (!this.enabled) return () => {};

        const startTime = performance.now();

        return () => {
            const endTime = performance.now();
            const duration = endTime - startTime;

            const metrics: RequestMetrics = {
                url,
                method,
                startTime,
                endTime,
                duration,
            };

            this.requestMetrics.push(metrics);

            // Keep only last 1000 metrics to prevent memory issues
            if (this.requestMetrics.length > 1000) {
                this.requestMetrics = this.requestMetrics.slice(-1000);
            }
        };
    }

    /**
     * Complete a request with additional data
     */
    completeRequest(
        url: string,
        method: string,
        status: number,
        size: number,
        cached: boolean = false
    ): void {
        if (!this.enabled) return;

        // Find the most recent matching request
        const matchingIndex = this.requestMetrics.findLastIndex(
            (m) => m.url === url && m.method === method && m.status === undefined
        );

        if (matchingIndex !== -1) {
            this.requestMetrics[matchingIndex].status = status;
            this.requestMetrics[matchingIndex].size = size;
            this.requestMetrics[matchingIndex].cached = cached;
        }
    }

    /**
     * Start tracking a render
     */
    startRender(component: string): () => void {
        if (!this.enabled) return () => {};

        const startTime = performance.now();

        return () => {
            const endTime = performance.now();
            const duration = endTime - startTime;

            const metrics: RenderMetrics = {
                component,
                startTime,
                endTime,
                duration,
            };

            this.renderMetrics.push(metrics);

            // Keep only last 1000 metrics
            if (this.renderMetrics.length > 1000) {
                this.renderMetrics = this.renderMetrics.slice(-1000);
            }
        };
    }

    /**
     * Get request statistics
     */
    getRequestStats(method?: string): PerformanceStats {
        if (this.requestMetrics.length === 0) {
            return {
                totalRequests: 0,
                totalDuration: 0,
                averageDuration: 0,
                minDuration: 0,
                maxDuration: 0,
                p50: 0,
                p90: 0,
                p95: 0,
                p99: 0,
                cacheHitRate: 0,
            };
        }

        let filtered = this.requestMetrics;
        if (method) {
            filtered = this.requestMetrics.filter((m) => m.method === method);
        }

        const durations = filtered.map((m) => m.duration).sort((a, b) => a - b);
        const totalDuration = durations.reduce((sum, d) => sum + d, 0);
        const cachedCount = filtered.filter((m) => m.cached).length;

        return {
            totalRequests: filtered.length,
            totalDuration,
            averageDuration: totalDuration / filtered.length,
            minDuration: durations[0] ?? 0,
            maxDuration: durations[durations.length - 1] ?? 0,
            p50: this.calculatePercentile(durations, 50),
            p90: this.calculatePercentile(durations, 90),
            p95: this.calculatePercentile(durations, 95),
            p99: this.calculatePercentile(durations, 99),
            cacheHitRate: filtered.length > 0 ? cachedCount / filtered.length : 0,
        };
    }

    /**
     * Get render statistics
     */
    getRenderStats(): {
        totalRenders: number;
        averageDuration: number;
        minDuration: number;
        maxDuration: number;
        slowestComponent: { component: string; duration: number } | null;
    } {
        if (this.renderMetrics.length === 0) {
            return {
                totalRenders: 0,
                averageDuration: 0,
                minDuration: 0,
                maxDuration: 0,
                slowestComponent: null,
            };
        }

        const durations = this.renderMetrics.map((m) => m.duration);
        const totalDuration = durations.reduce((sum, d) => sum + d, 0);
        const slowest = this.renderMetrics.reduce((slowest, current) =>
            current.duration > slowest.duration ? current : slowest
        );

        return {
            totalRenders: this.renderMetrics.length,
            averageDuration: totalDuration / this.renderMetrics.length,
            minDuration: Math.min(...durations),
            maxDuration: Math.max(...durations),
            slowestComponent: {
                component: slowest.component,
                duration: slowest.duration,
            },
        };
    }

    /**
     * Clear all metrics
     */
    clear(): void {
        this.requestMetrics = [];
        this.renderMetrics = [];
    }

    /**
     * Get all request metrics
     */
    getRequestMetrics(): RequestMetrics[] {
        return [...this.requestMetrics];
    }

    /**
     * Get all render metrics
     */
    getRenderMetrics(): RenderMetrics[] {
        return [...this.renderMetrics];
    }

    /**
     * Enable or disable performance monitoring
     */
    setEnabled(enabled: boolean): void {
        this.enabled = enabled;
        if (!enabled) {
            this.clear();
        }
    }
}

/**
 * Default performance monitor instance
 */
const defaultMonitor = new PerformanceMonitor();

/**
 * Start tracking a request
 */
export function trackRequest(url: string, method: string): () => void {
    return defaultMonitor.startRequest(url, method);
}

/**
 * Complete a request with additional data
 */
export function completeRequest(
    url: string,
    method: string,
    status: number,
    size: number,
    cached: boolean = false
): void {
    defaultMonitor.completeRequest(url, method, status, size, cached);
}

/**
 * Start tracking a render
 */
export function trackRender(component: string): () => void {
    return defaultMonitor.startRender(component);
}

/**
 * Get request statistics
 */
export function getRequestStats(method?: string): PerformanceStats {
    return defaultMonitor.getRequestStats(method);
}

/**
 * Get render statistics
 */
export function getRenderStats() {
    return defaultMonitor.getRenderStats();
}

/**
 * Clear all performance metrics
 */
export function clearPerformanceMetrics(): void {
    defaultMonitor.clear();
}

/**
 * Enable or disable performance monitoring
 */
export function setPerformanceMonitoringEnabled(enabled: boolean): void {
    defaultMonitor.setEnabled(enabled);
}

/**
 * Decorator for measuring component render time
 *
 * Note: Uses `any` for constructor parameters which is acceptable for decorator pattern
 * since we need to preserve the original constructor signature without knowing the exact types.
 */
export function measureRender(componentName: string) {
    return function <T extends new (...args: any[]) => any>(constructor: T) {
        return class extends constructor {
            constructor(...args: any[]) {
                super(...args);
                const stopTracking = trackRender(componentName);
                // Use requestAnimationFrame to measure after render
                requestAnimationFrame(() => {
                    stopTracking();
                });
            }
        };
    };
}

/**
 * Measure async function execution time
 */
export async function measureAsync<T>(
    name: string,
    fn: () => Promise<T>
): Promise<T> {
    const stopTracking = trackRequest(name, "CUSTOM");
    try {
        const result = await fn();
        stopTracking();
        return result;
    } catch (error) {
        stopTracking();
        throw error;
    }
}

/**
 * Measure sync function execution time
 */
export function measureSync<T>(name: string, fn: () => T): T {
    const stopTracking = trackRequest(name, "CUSTOM");
    try {
        const result = fn();
        stopTracking();
        return result;
    } catch (error) {
        stopTracking();
        throw error;
    }
}
