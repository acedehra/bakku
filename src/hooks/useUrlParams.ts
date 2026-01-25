import { useState, useEffect, useRef } from "react";
import { getBaseUrl, buildUrlWithParams, parseUrlParams } from "../utils/urlParser";

export function useUrlParams(initialUrl: string) {
    const [url, setUrl] = useState(initialUrl);
    const [params, setParams] = useState<Record<string, string>>({});

    // Refs to prevent infinite loops when syncing URL and params
    const isUpdatingFromParams = useRef(false);
    const isUpdatingFromUrl = useRef(false);
    const lastProcessedUrl = useRef<string>('');
    const lastProcessedParams = useRef<string>('');

    // Update URL when params change
    useEffect(() => {
        if (isUpdatingFromUrl.current) {
            isUpdatingFromUrl.current = false;
            return;
        }

        const paramsStr = JSON.stringify(params);
        // Skip if we've already processed these exact params
        if (lastProcessedParams.current === paramsStr) {
            return;
        }

        isUpdatingFromParams.current = true;
        lastProcessedParams.current = paramsStr;

        try {
            const baseUrl = getBaseUrl(url);
            const newUrl = buildUrlWithParams(baseUrl, params);
            // Only update if URL actually changed
            if (newUrl !== url) {
                lastProcessedUrl.current = newUrl;
                setUrl(newUrl);
            }
        } catch {
            // Ignore errors - if building fails, keep current URL
        }

        // Reset flag synchronously after scheduling the update
        isUpdatingFromParams.current = false;
    }, [params, url]);

    // Parse URL and update params when URL changes
    useEffect(() => {
        if (isUpdatingFromParams.current) {
            isUpdatingFromParams.current = false;
            return;
        }

        // Skip if we've already processed this exact URL
        if (lastProcessedUrl.current === url) {
            return;
        }

        isUpdatingFromUrl.current = true;
        lastProcessedUrl.current = url;

        try {
            const urlParams = parseUrlParams(url);
            const newParamsStr = JSON.stringify(urlParams);
            // Only update if params actually changed to avoid unnecessary re-renders
            const currentParamsStr = JSON.stringify(params);
            if (currentParamsStr !== newParamsStr) {
                lastProcessedParams.current = newParamsStr;
                setParams(urlParams);
            }
        } catch {
            // Ignore errors - if parsing fails, keep current params
        }

        // Reset flag synchronously after scheduling the update
        isUpdatingFromUrl.current = false;
    }, [url, params]);

    const updateFromHistory = (newUrl: string, newParams: Record<string, string>) => {
        isUpdatingFromParams.current = true;
        isUpdatingFromUrl.current = true;

        lastProcessedUrl.current = newUrl;
        lastProcessedParams.current = JSON.stringify(newParams);

        setUrl(newUrl);
        setParams(newParams);

        // Reset flags after a brief delay to allow state updates
        setTimeout(() => {
            isUpdatingFromParams.current = false;
            isUpdatingFromUrl.current = false;
        }, 0);
    };

    return {
        url,
        setUrl,
        params,
        setParams,
        updateFromHistory,
    };
}
