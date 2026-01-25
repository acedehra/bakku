import { useEffect, useState } from "react";
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
import { usePanelResize } from "./hooks/usePanelResize";
import { useRequestHistory } from "./hooks/useRequestHistory";
import { useUrlParams } from "./hooks/useUrlParams";
import { executeHttpRequest, formatError } from "./utils/httpClient";
import { getBaseUrl, buildUrlWithParams } from "./utils/urlParser";

function App() {
  useEffect(() => {
    // Force dark theme globally while the app is mounted
    document.documentElement.classList.add("dark");
    return () => {
      document.documentElement.classList.remove("dark");
    };
  }, []);

  const {
    sidebarWidth,
    responseWidth,
    handleSidebarResize,
    handleResponseResize,
  } = usePanelResize();

  const {
    history,
    addToHistory
  } = useRequestHistory();

  const {
    url,
    setUrl,
    params,
    setParams,
    updateFromHistory
  } = useUrlParams("https://jsonplaceholder.typicode.com/todos/1");

  const [method, setMethod] = useState<HttpMethod>("GET");
  const [headers, setHeaders] = useState<Record<string, string>>({});
  const [body, setBody] = useState("");
  const [auth, setAuth] = useState<AuthConfig>({ type: "None" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<ResponseData | null>(null);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);

  async function sendRequest() {
    setLoading(true);
    setError(null);
    setResponse(null);
    setSelectedHistoryId(null);

    try {
      const responseData = await executeHttpRequest(method, url, headers, body, auth);
      setResponse(responseData);

      // Save to history
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
        id: `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        method,
        url,
        timestamp: Date.now(),
        status: responseData.status,
        statusText: responseData.statusText,
        requestData,
        responseData,
      };

      addToHistory(historyItem);
    } catch (err) {
      const errorMessage = formatError(err);
      setError(errorMessage);

      // Save failed request to history
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
        id: `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        method,
        url,
        timestamp: Date.now(),
        status: null,
        statusText: null,
        requestData,
        responseData: null,
      };

      addToHistory(historyItem);
    } finally {
      setLoading(false);
    }
  }

  const handleHistorySelect = (item: RequestHistoryItem) => {
    setMethod(item.requestData.method);

    // Build full URL with params when loading from history
    const fullUrl = buildUrlWithParams(item.requestData.url, item.requestData.params);

    updateFromHistory(fullUrl, item.requestData.params);

    setHeaders(item.requestData.headers);
    setBody(item.requestData.body);
    setAuth(item.requestData.auth);
    setSelectedHistoryId(item.id);

    if (item.responseData) {
      setResponse(item.responseData);
    } else {
      setResponse(null);
    }
    setError(null);
  };

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
