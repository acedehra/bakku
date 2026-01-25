import { useEffect, useState, useCallback, useRef } from "react";
import { fetch as tauriFetch } from "@tauri-apps/plugin-http";
import "./App.css";
import { HistorySidebar } from "./components/HistorySidebar";
import { RequestPane } from "./components/RequestPane";
import { ResponsePane } from "./components/ResponsePane";
import { ResizeHandle } from "./components/ResizeHandle";
import {
  HttpMethod,
  RequestData,
  ResponseData,
  RequestHistoryItem,
  AuthConfig,
} from "./types";

const HISTORY_STORAGE_KEY = "kordix_request_history";
const MAX_HISTORY_ITEMS = 100;
const PANEL_WIDTHS_STORAGE_KEY = "kordix_panel_widths";

function App() {
  useEffect(() => {
    // Force dark theme globally while the app is mounted
    document.documentElement.classList.add("dark");
    return () => {
      document.documentElement.classList.remove("dark");
    };
  }, []);

  // Load panel widths from localStorage
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    try {
      const stored = localStorage.getItem(PANEL_WIDTHS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.sidebarWidth || 256;
      }
    } catch {
      // Ignore errors
    }
    return 256;
  });

  const [responseWidth, setResponseWidth] = useState(() => {
    try {
      const stored = localStorage.getItem(PANEL_WIDTHS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.responseWidth || 450;
      }
    } catch {
      // Ignore errors
    }
    return 450;
  });

  // Save panel widths to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(
        PANEL_WIDTHS_STORAGE_KEY,
        JSON.stringify({ sidebarWidth, responseWidth })
      );
    } catch (err) {
      console.error("Failed to save panel widths to localStorage", err);
    }
  }, [sidebarWidth, responseWidth]);

  const [method, setMethod] = useState<HttpMethod>("GET");
  const [url, setUrl] = useState("https://jsonplaceholder.typicode.com/todos/1");
  const [headers, setHeaders] = useState<Record<string, string>>({});
  const [params, setParams] = useState<Record<string, string>>({});
  const [body, setBody] = useState("");
  const [auth, setAuth] = useState<AuthConfig>({ type: "None" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<ResponseData | null>(null);
  const [history, setHistory] = useState<RequestHistoryItem[]>([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(
    null
  );

  // Refs to prevent infinite loops when syncing URL and params
  const isUpdatingFromParams = useRef(false);
  const isUpdatingFromUrl = useRef(false);
  const lastProcessedUrl = useRef<string>('');
  const lastProcessedParams = useRef<string>('');

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as RequestHistoryItem[];
        setHistory(parsed);
      }
    } catch (err) {
      console.error("Failed to load history from localStorage", err);
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch (err) {
      console.error("Failed to save history to localStorage", err);
    }
  }, [history]);

  // Check if URL has a protocol
  const hasProtocol = (url: string): boolean => {
    return /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(url);
  };

  // Extract base URL (without query params) from a full URL
  const getBaseUrl = (fullUrl: string): string => {
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
  const parseUrlParams = (fullUrl: string): Record<string, string> => {
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
  const buildUrlWithParams = (baseUrl: string, queryParams: Record<string, string>): string => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  const buildAuthHeaders = (authConfig: AuthConfig): Record<string, string> => {
    const authHeaders: Record<string, string> = {};
    if (authConfig.type === "Basic" && authConfig.username && authConfig.password) {
      const credentials = btoa(`${authConfig.username}:${authConfig.password}`);
      authHeaders["Authorization"] = `Basic ${credentials}`;
    } else if (authConfig.type === "Bearer" && authConfig.token) {
      authHeaders["Authorization"] = `Bearer ${authConfig.token}`;
    } else if (
      authConfig.type === "Custom" &&
      authConfig.headerName &&
      authConfig.headerValue
    ) {
      authHeaders[authConfig.headerName] = authConfig.headerValue;
    }
    return authHeaders;
  };

  async function sendRequest() {
    setLoading(true);
    setError(null);
    setResponse(null);
    setSelectedHistoryId(null);

    const startTime = performance.now();

    try {
      // Validate URL format before making the request
      let requestUrl: string;
      try {
        // URL already contains params, so use it directly
        requestUrl = url;
        new URL(requestUrl);
      } catch {
        setError(
          "Invalid URL format. Please enter a valid URL (e.g., https://example.com)"
        );
        setLoading(false);
        return;
      }

      const authHeaders = buildAuthHeaders(auth);
      const allHeaders = { ...headers, ...authHeaders };

      const options: {
        method: string;
        headers?: Record<string, string>;
        body?: string;
      } = { method };

      if (Object.keys(allHeaders).length > 0) {
        options.headers = allHeaders;
      }

      const canHaveBody = method !== "GET" && method !== "HEAD";
      if (canHaveBody && body.trim()) {
        options.body = body;
        if (!options.headers) {
          options.headers = {};
        }
        if (!options.headers["Content-Type"]) {
          options.headers["Content-Type"] = "application/json";
        }
      }

      const res = await tauriFetch(requestUrl, options);
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

      const responseData: ResponseData = {
        status: res.status,
        statusText: res.statusText,
        headers: responseHeaders,
        body: formattedBody,
        timing,
        size: responseSize,
      };

      setResponse(responseData);

      // Save to history (store base URL without params)
      const baseUrl = getBaseUrl(url);
      const requestData: RequestData = {
        method,
        url: baseUrl,
        headers,
        params,
        body,
        auth,
      };

      const historyItem: RequestHistoryItem = {
        id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        method,
        url,
        timestamp: Date.now(),
        status: res.status,
        statusText: res.statusText,
        requestData,
        responseData,
      };

      setHistory((prev) => {
        const updated = [historyItem, ...prev];
        // Limit to MAX_HISTORY_ITEMS
        return updated.slice(0, MAX_HISTORY_ITEMS);
      });
    } catch (err) {
      let errorMessage = "Unknown error";

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
          errorMessage = `Domain not found: Unable to resolve the domain name. Please check if the URL is correct.`;
        }
        // Check for invalid URL errors
        else if (
          message.includes("invalid url") ||
          message.includes("invalid uri") ||
          message.includes("parse error")
        ) {
          errorMessage = `Invalid URL: The URL format is incorrect. Please check the URL and try again.`;
        }
        // Check for connection errors
        else if (
          message.includes("connection") ||
          message.includes("timeout") ||
          message.includes("network")
        ) {
          errorMessage = `Connection error: ${err.message}`;
        }
        // Check for SSL/TLS errors
        else if (
          message.includes("ssl") ||
          message.includes("tls") ||
          message.includes("certificate")
        ) {
          errorMessage = `SSL/TLS error: ${err.message}`;
        }
        // Use the original error message if it's descriptive
        else if (err.message && err.message.trim() !== "") {
          errorMessage = err.message;
        }
      } else if (typeof err === "string") {
        errorMessage = err;
      }

      setError(errorMessage);

      // Save failed request to history (store base URL without params)
      const baseUrl = getBaseUrl(url);
      const requestData: RequestData = {
        method,
        url: baseUrl,
        headers,
        params,
        body,
        auth,
      };

      const historyItem: RequestHistoryItem = {
        id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        method,
        url,
        timestamp: Date.now(),
        status: null,
        statusText: null,
        requestData,
        responseData: null,
      };

      setHistory((prev) => {
        const updated = [historyItem, ...prev];
        return updated.slice(0, MAX_HISTORY_ITEMS);
      });
    } finally {
      setLoading(false);
    }
  }

  const handleHistorySelect = (item: RequestHistoryItem) => {
    // Reset tracking refs when loading from history
    isUpdatingFromParams.current = true;
    isUpdatingFromUrl.current = true;
    
    setMethod(item.requestData.method);
    // Build full URL with params when loading from history
    const fullUrl = buildUrlWithParams(item.requestData.url, item.requestData.params);
    lastProcessedUrl.current = fullUrl;
    lastProcessedParams.current = JSON.stringify(item.requestData.params);
    setUrl(fullUrl);
    setHeaders(item.requestData.headers);
    setParams(item.requestData.params);
    setBody(item.requestData.body);
    setAuth(item.requestData.auth);
    setSelectedHistoryId(item.id);
    if (item.responseData) {
      setResponse(item.responseData);
    } else {
      setResponse(null);
    }
    setError(null);
    
    // Reset flags after a brief delay to allow state updates
    setTimeout(() => {
      isUpdatingFromParams.current = false;
      isUpdatingFromUrl.current = false;
    }, 0);
  };

  const handleSidebarResize = useCallback((deltaX: number) => {
    setSidebarWidth((prev: number) => Math.max(200, Math.min(600, prev + deltaX)));
  }, []);

  const handleResponseResize = useCallback((deltaX: number) => {
    setResponseWidth((prev: number) => Math.max(300, Math.min(800, prev - deltaX)));
  }, []);

  return (
    <div className="h-screen bg-background text-foreground flex overflow-hidden">
      <div style={{ width: `${sidebarWidth}px` }} className="h-screen flex-shrink-0">
        <HistorySidebar
          history={history}
          selectedId={selectedHistoryId}
          onSelect={handleHistorySelect}
        />
      </div>
      <ResizeHandle onResize={handleSidebarResize} />
      <RequestPane
        method={method}
        url={url}
        headers={headers}
        params={params}
        body={body}
        auth={auth}
        onMethodChange={setMethod}
        onUrlChange={setUrl}
        onHeadersChange={setHeaders}
        onParamsChange={setParams}
        onBodyChange={setBody}
        onAuthChange={setAuth}
        onSend={sendRequest}
        loading={loading}
      />
      <ResizeHandle onResize={handleResponseResize} />
      <div style={{ width: `${responseWidth}px` }} className="h-screen flex-shrink-0">
        <ResponsePane response={response} error={error} loading={loading} />
      </div>
    </div>
  );
}

export default App;
