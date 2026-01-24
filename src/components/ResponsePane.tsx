import { useState } from "react";
import { ResponseData } from "../types";

interface ResponsePaneProps {
  response: ResponseData | null;
  error: string | null;
  loading: boolean;
}

type ResponseTab = "Pretty" | "Headers" | "Info";

export function ResponsePane({
  response,
  error,
  loading,
}: ResponsePaneProps) {
  const [activeTab, setActiveTab] = useState<ResponseTab>("Pretty");

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${Math.round(ms)} ms`;
    return `${(ms / 1000).toFixed(2)} s`;
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "text-green-500";
    if (status >= 300 && status < 400) return "text-yellow-500";
    if (status >= 400) return "text-red-500";
    return "text-muted-foreground";
  };

  const tabs: ResponseTab[] = ["Pretty", "Headers", "Info"];

  return (
    <div className="w-full h-screen flex flex-col bg-background border-l border-border">
      {response && (
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-4 mb-4">
            <span
              className={`text-lg font-semibold ${getStatusColor(
                response.status
              )}`}
            >
              {response.status} {response.statusText}
            </span>
            <span className="text-sm text-muted-foreground">
              {formatTime(response.timing)}
            </span>
            <span className="text-sm text-muted-foreground">
              {formatSize(response.size)}
            </span>
          </div>
          <div className="flex gap-1 border-b border-border">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-4">
        {loading && (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Sending request...
          </div>
        )}
        {error && (
          <div className="text-sm text-destructive whitespace-pre-wrap">
            {error}
          </div>
        )}
        {!loading && !error && !response && (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Send a request to see the response here.
          </div>
        )}
        {!loading && !error && response && (
          <>
            {activeTab === "Pretty" && (
              <pre className="text-xs whitespace-pre-wrap font-mono">
                {response.body || "(empty response)"}
              </pre>
            )}
            {activeTab === "Headers" && (
              <div className="space-y-2">
                {Object.entries(response.headers).map(([key, value]) => (
                  <div key={key} className="text-sm">
                    <span className="font-medium">{key}:</span>{" "}
                    <span className="text-muted-foreground">{value}</span>
                  </div>
                ))}
                {Object.keys(response.headers).length === 0 && (
                  <div className="text-sm text-muted-foreground">
                    No headers
                  </div>
                )}
              </div>
            )}
            {activeTab === "Info" && (
              <div className="space-y-4 text-sm">
                <div>
                  <div className="font-medium mb-1">Status Code</div>
                  <div className="text-muted-foreground">{response.status}</div>
                </div>
                <div>
                  <div className="font-medium mb-1">Status Text</div>
                  <div className="text-muted-foreground">
                    {response.statusText}
                  </div>
                </div>
                <div>
                  <div className="font-medium mb-1">Response Time</div>
                  <div className="text-muted-foreground">
                    {formatTime(response.timing)}
                  </div>
                </div>
                <div>
                  <div className="font-medium mb-1">Response Size</div>
                  <div className="text-muted-foreground">
                    {formatSize(response.size)}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
