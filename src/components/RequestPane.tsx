import { useState, useCallback } from "react";
import { HttpMethod, Environment, KVEntry, AuthConfig } from "../types";
import { VariableInput } from "./VariableInput";
import { ParamsTab } from "./ParamsTab";
import { HeadersTab } from "./HeadersTab";
import { useKeyboardShortcuts } from "./request-pane/useKeyboardShortcuts";
import RequestTabs, { RequestTab } from "./request-pane/RequestTabs";
import MethodSelector from "./request-pane/MethodSelector";
import UrlInput from "./request-pane/UrlInput";
import EnvironmentSelector from "./request-pane/EnvironmentSelector";
import AuthTab from "./request-pane/auth/AuthTab";

interface RequestPaneProps {
  method: HttpMethod;
  url: string;
  headers: KVEntry[];
  paramEntries: KVEntry[];
  body: string;
  auth: AuthConfig;
  onMethodChange: (method: HttpMethod) => void;
  onUrlChange: (url: string) => void;
  onHeadersChange: (headers: KVEntry[]) => void;
  onParamEntriesChange: (params: KVEntry[]) => void;
  onBodyChange: (body: string) => void;
  onAuthChange: (auth: AuthConfig) => void;
  onSend: () => void;
  loading: boolean;
  environments: Environment[];
  activeEnvId: string | null;
  onActiveEnvChange: (id: string | null) => void;
  onOpenEnvManager: () => void;
}

export function RequestPane({
  method,
  url,
  headers,
  paramEntries,
  body,
  auth,
  onMethodChange,
  onUrlChange,
  onHeadersChange,
  onParamEntriesChange,
  onBodyChange,
  onAuthChange,
  onSend,
  loading,
  environments,
  activeEnvId,
  onActiveEnvChange,
  onOpenEnvManager,
}: RequestPaneProps) {
  const [activeTab, setActiveTab] = useState<RequestTab>("Body");

  const activeEnv = environments.find((e) => e.id === activeEnvId) || null;
  const canHaveBody = method !== "GET" && method !== "HEAD";

  const paramCount = paramEntries.filter((e) => e.key.trim() !== "" && e.enabled).length;
  const headerCount = headers.filter((h) => h.key.trim() !== "" && h.enabled).length;

  const { handleSend } = useKeyboardShortcuts({
    method,
    url,
    loading,
    onSend,
  });

  const handleUrlClick = useCallback(() => {
    if (url.includes("?")) {
      setActiveTab("Params");
    }
  }, [url]);

  return (
    <div className="flex-1 h-screen flex flex-col bg-background">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
              Request Builder
            </span>
          </div>
          <EnvironmentSelector
            environments={environments}
            activeEnvId={activeEnvId}
            onActiveEnvChange={onActiveEnvChange}
            onOpenEnvManager={onOpenEnvManager}
          />
        </div>
        <div className="flex gap-2 mb-4">
          <MethodSelector value={method} onChange={onMethodChange} />
          <UrlInput
            value={url}
            environment={activeEnv}
            onChange={onUrlChange}
            onClick={handleUrlClick}
            className="flex-1"
          />
          <button
            onClick={handleSend}
            disabled={loading || !url.trim()}
            className="h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Send request (Ctrl/Cmd + Enter)"
            title="Send request (Ctrl/Cmd + Enter)"
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </div>
        <RequestTabs
          activeTab={activeTab}
          onChange={setActiveTab}
          paramCount={paramCount}
          headerCount={headerCount}
        />
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "Body" && (
          <div className="space-y-2">
            {canHaveBody ? (
              <VariableInput
                type="textarea"
                value={body}
                environment={activeEnv}
                onChange={(val) => onBodyChange(val)}
                rows={20}
                placeholder='{"title": "New item"}'
                className="w-full"
              />
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                No Body
              </div>
            )}
          </div>
        )}
        {activeTab === "Params" && (
          <ParamsTab
            paramEntries={paramEntries}
            onParamEntriesChange={onParamEntriesChange}
            activeEnv={activeEnv}
          />
        )}
        {activeTab === "Headers" && (
          <HeadersTab
            headers={headers}
            onHeadersChange={onHeadersChange}
            activeEnv={activeEnv}
          />
        )}
        {activeTab === "Auth" && (
          <AuthTab auth={auth} environment={activeEnv} onChange={onAuthChange} />
        )}
      </div>
    </div>
  );
}
