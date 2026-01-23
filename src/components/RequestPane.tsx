import { useState } from "react";
import { RequestData, HttpMethod, AuthType } from "../types";
import { Trash2 } from "lucide-react";
import {Button} from "@/components/ui/button";

interface RequestPaneProps {
  method: HttpMethod;
  url: string;
  headers: Record<string, string>;
  params: Record<string, string>;
  body: string;
  auth: RequestData["auth"];
  onMethodChange: (method: HttpMethod) => void;
  onUrlChange: (url: string) => void;
  onHeadersChange: (headers: Record<string, string>) => void;
  onParamsChange: (params: Record<string, string>) => void;
  onBodyChange: (body: string) => void;
  onAuthChange: (auth: RequestData["auth"]) => void;
  onSend: () => void;
  loading: boolean;
}

type RequestTab = "Body" | "Params" | "Headers" | "Auth";

export function RequestPane({
  method,
  url,
  headers,
  params,
  body,
  auth,
  onMethodChange,
  onUrlChange,
  onHeadersChange,
  onParamsChange,
  onBodyChange,
  onAuthChange,
  onSend,
  loading,
}: RequestPaneProps) {
  const [activeTab, setActiveTab] = useState<RequestTab>("Body");

  const canHaveBody = method !== "GET" && method !== "HEAD";

  const updateHeader = (key: string, value: string) => {
    const newHeaders = { ...headers };
    if (value.trim() === "") {
      delete newHeaders[key];
    } else {
      newHeaders[key] = value;
    }
    onHeadersChange(newHeaders);
  };

  const addHeader = () => {
    const newKey = `header-${Date.now()}`;
    onHeadersChange({ ...headers, [newKey]: "" });
  };

  const deleteHeader = (key: string) => {
    const newHeaders = { ...headers };
    delete newHeaders[key];
    onHeadersChange(newHeaders);
  };

  const updateParam = (key: string, value: string) => {
    const newParams = { ...params };
    if (value.trim() === "") {
      delete newParams[key];
    } else {
      newParams[key] = value;
    }
    onParamsChange(newParams);
  };

  const addParam = () => {
    const newKey = `param-${Date.now()}`;
    onParamsChange({ ...params, [newKey]: "" });
  };

  const tabs: RequestTab[] = ["Body", "Params", "Headers", "Auth"];

  return (
    <div className="flex-1 h-screen flex flex-col bg-background border-r border-border">
      <div className="p-4 border-b border-border">
        <div className="flex gap-2 mb-4">
          <select
            value={method}
            onChange={(e) => onMethodChange(e.target.value as HttpMethod)}
            className="h-10 rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD"].map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder="https://api.example.com/resource"
            className="flex-1 h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <button
            onClick={onSend}
            disabled={loading || !url.trim()}
            className="h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Send"}
          </button>
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
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "Body" && (
          <div className="space-y-2">
            {canHaveBody ? (
              <textarea
                value={body}
                onChange={(e) => onBodyChange(e.target.value)}
                rows={20}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder='{"title": "New item"}'
              />
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                No Body
              </div>
            )}
          </div>
        )}
        {activeTab === "Params" && (
          <div className="space-y-2">
            {Object.entries(params).map(([key, value]) => (
              <div key={key} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Key"
                  value={key}
                  onChange={(e) => {
                    const newParams = { ...params };
                    delete newParams[key];
                    newParams[e.target.value] = value;
                    onParamsChange(newParams);
                  }}
                  className="flex-1 h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <input
                  type="text"
                  placeholder="Value"
                  value={value}
                  onChange={(e) => updateParam(key, e.target.value)}
                  className="flex-1 h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            ))}
            <button
              onClick={addParam}
              className="px-4 py-2 text-sm rounded-md border border-input bg-background hover:bg-accent"
            >
              + Add Param
            </button>
          </div>
        )}
        {activeTab === "Headers" && (
          <div className="space-y-2">
            {Object.entries(headers).map(([key, value]) => (
              <div key={key} className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Header name"
                  value={key}
                  onChange={(e) => {
                    const newHeaders = { ...headers };
                    delete newHeaders[key];
                    newHeaders[e.target.value] = value;
                    onHeadersChange(newHeaders);
                  }}
                  className="flex-1 h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <input
                  type="text"
                  placeholder="Header value"
                  value={value}
                  onChange={(e) => updateHeader(key, e.target.value)}
                  className="flex-1 h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                
                  <Button 
                  onClick={() => deleteHeader(key)}
                  variant="outline" size="icon" aria-label="Delete header" title="Delete header">
                    
                 <Trash2/>
                </Button>
              </div>
            ))}
            <button
              onClick={addHeader}
              className="px-4 py-2 text-sm rounded-md border border-input bg-background hover:bg-accent"
            >
              + Add Header
            </button>
          </div>
        )}
        {activeTab === "Auth" && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Auth Type
              </label>
              <select
                value={auth.type}
                onChange={(e) =>
                  onAuthChange({ ...auth, type: e.target.value as AuthType })
                }
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="None">None</option>
                <option value="Basic">Basic Auth</option>
                <option value="Bearer">Bearer Token</option>
                <option value="Custom">Custom Header</option>
              </select>
            </div>
            {auth.type === "Basic" && (
              <>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Username
                  </label>
                  <input
                    type="text"
                    value={auth.username || ""}
                    onChange={(e) =>
                      onAuthChange({ ...auth, username: e.target.value })
                    }
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Password
                  </label>
                  <input
                    type="password"
                    value={auth.password || ""}
                    onChange={(e) =>
                      onAuthChange({ ...auth, password: e.target.value })
                    }
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              </>
            )}
            {auth.type === "Bearer" && (
              <div>
                <label className="text-sm font-medium mb-2 block">Token</label>
                <input
                  type="text"
                  value={auth.token || ""}
                  onChange={(e) =>
                    onAuthChange({ ...auth, token: e.target.value })
                  }
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            )}
            {auth.type === "Custom" && (
              <>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Header Name
                  </label>
                  <input
                    type="text"
                    value={auth.headerName || ""}
                    onChange={(e) =>
                      onAuthChange({ ...auth, headerName: e.target.value })
                    }
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Header Value
                  </label>
                  <input
                    type="text"
                    value={auth.headerValue || ""}
                    onChange={(e) =>
                      onAuthChange({ ...auth, headerValue: e.target.value })
                    }
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
