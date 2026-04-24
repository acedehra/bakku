import { useState, useEffect } from "react";
import { HttpMethod, AuthType, Environment, KVEntry, AuthConfig } from "../types";
import { Trash2, FileText, List, Settings2, ShieldCheck, Eye, EyeOff, Settings, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VariableInput } from "./VariableInput";
import { keyboardShortcuts, announceRequestSent } from "../utils/accessibility";
import { ParamsTab } from "./ParamsTab";
import { HeadersTab } from "./HeadersTab";

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

type RequestTab = "Body" | "Params" | "Headers" | "Auth";

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
  const [showPassword, setShowPassword] = useState(false);
  const [showToken, setShowToken] = useState(false);

  // Set up keyboard shortcuts
  useEffect(() => {
    const unregisterSend = keyboardShortcuts.register("CtrlOrCmd+Enter", () => {
      if (url.trim() && !loading) {
        handleSend();
      }
    });

    return () => {
      unregisterSend();
    };
  }, [url, loading]);

  const handleSend = () => {
    announceRequestSent(method, url);
    onSend();
  };

  const activeEnv = environments.find(e => e.id === activeEnvId) || null;
  const canHaveBody = method !== "GET" && method !== "HEAD";

  const tabs: RequestTab[] = ["Body", "Params", "Headers", "Auth"];

  const tabIcons: Record<RequestTab, React.ReactNode> = {
    Body: <FileText size={14} />,
    Params: <List size={14} />,
    Headers: <Settings2 size={14} />,
    Auth: <ShieldCheck size={14} />,
  };

  const paramCount = paramEntries.filter(e => e.key.trim() !== "" && e.enabled).length;
  const headerCount = headers.filter(h => h.key.trim() !== "" && h.enabled).length;

  return (
    <div className="flex-1 h-screen flex flex-col bg-background">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Request Builder</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 border border-border/50 hover:bg-accent/30 transition-colors group">
              <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-70 group-hover:text-primary transition-colors">Environment</span>
              <div className="relative flex items-center h-6 min-w-[140px]">
                <select
                  value={activeEnvId || ""}
                  onChange={(e) => onActiveEnvChange(e.target.value || null)}
                  className="w-full appearance-none bg-transparent pr-5 text-xs font-bold focus:outline-none cursor-pointer text-primary"
                >
                  <option value="">No Environment</option>
                  {environments.map((env) => (
                    <option key={env.id} value={env.id}>
                      {env.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={10} className="absolute right-0 pointer-events-none opacity-50 text-primary" />
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={onOpenEnvManager}
              className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/5 border-border/50 transition-all rounded-full"
              title="Manage Environments"
            >
              <Settings size={14} />
            </Button>
          </div>
        </div>
        <div className="flex gap-2 mb-4">
          <select
            value={method}
            onChange={(e) => onMethodChange(e.target.value as HttpMethod)}
            className="h-10 rounded-md border border-input bg-background px-2 text-sm font-bold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
            aria-label="HTTP method"
          >
            {["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD"].map((m) => (
              <option key={m} value={m} className="font-sans">
                {m}
              </option>
            ))}
          </select>
          <VariableInput
            value={url}
            environment={activeEnv}
            onClick={() => {
              if (url.includes('?')) {
                setActiveTab("Params");
              }
            }}
            onChange={(val) => onUrlChange(val)}
            placeholder="https://api.example.com/resource"
            className="flex-1"
            aria-label="Request URL"
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
        <div className="flex gap-1 border-b border-border">
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            const count = tab === "Params" ? paramCount : tab === "Headers" ? headerCount : 0;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 px-6 py-2.5 text-sm font-extrabold transition-all duration-300 outline-none ${isActive
                  ? "text-primary-foreground bg-primary shadow-xl rounded-lg scale-[1.02]"
                  : "text-muted-foreground/30 hover:text-muted-foreground/60 hover:bg-accent/10"
                  }`}
              >
                <span className={`transition-opacity duration-300 ${isActive ? "opacity-100" : "opacity-30"}`}>
                  {tabIcons[tab]}
                </span>
                <span className={`transition-all duration-300 ${isActive ? "opacity-100" : "opacity-30"}`}>
                  {tab}
                </span>
                {count > 0 && (
                  <span className={`inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 text-[10px] font-bold rounded-full transition-all ${isActive ? "bg-primary-foreground text-primary shadow-sm" : "bg-muted/20 text-muted-foreground/20"
                    }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
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
                className={`w-full h-10 rounded-md border text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all ${auth.type !== "None" ? "border-primary/50 bg-primary/5 text-primary" : "border-input bg-background"
                  }`}
              >
                <option value="None">None</option>
                <option value="Basic">Basic Auth</option>
                <option value="Bearer">Bearer Token</option>
                <option value="Custom">Custom Header</option>
              </select>
            </div>
            {auth.type === "Basic" && (
              <>
                <div className="p-3 rounded-lg border border-border/40 focus-within:border-primary/50 focus-within:bg-primary/5 transition-all shadow-sm">
                  <label className="text-sm font-medium mb-2 block">
                    Username
                  </label>
                  <VariableInput
                    value={auth.username || ""}
                    environment={activeEnv}
                    onChange={(val) =>
                      onAuthChange({ ...auth, username: val })
                    }
                    className="w-full"
                  />
                </div>
                <div className="p-3 rounded-lg border border-border/40 focus-within:border-primary/50 focus-within:bg-primary/5 transition-all shadow-sm">
                  <label className="text-sm font-medium mb-2 block">
                    Password
                  </label>
                  <div className="relative">
                    <VariableInput
                      value={auth.password || ""}
                      environment={activeEnv}
                      onChange={(val) =>
                        onAuthChange({ ...auth, password: val })
                      }
                      className="w-full"
                      type={showPassword ? "text" : "password"}
                      aria-label={showPassword ? "Password - visible" : "Password - hidden"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      aria-pressed={showPassword}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </>
            )}
            {auth.type === "Bearer" && (
              <div className="p-3 rounded-lg border border-border/40 focus-within:border-primary/50 focus-within:bg-primary/5 transition-all shadow-sm">
                <label className="text-sm font-medium mb-2 block">Token</label>
                <div className="relative">
                  <VariableInput
                    value={auth.token || ""}
                    environment={activeEnv}
                    onChange={(val) =>
                      onAuthChange({ ...auth, token: val })
                    }
                    className="w-full"
                    type={showToken ? "text" : "password"}
                    aria-label={showToken ? "Token - visible" : "Token - hidden"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showToken ? "Hide token" : "Show token"}
                    aria-pressed={showToken}
                  >
                    {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}
            {auth.type === "Custom" && (
              <>
                <div className="p-3 rounded-lg border border-border/40 focus-within:border-primary/50 focus-within:bg-primary/5 transition-all shadow-sm">
                  <label className="text-sm font-medium mb-2 block">
                    Header Name
                  </label>
                  <VariableInput
                    value={auth.headerName || ""}
                    environment={activeEnv}
                    onChange={(val) =>
                      onAuthChange({ ...auth, headerName: val })
                    }
                    className="w-full"
                  />
                </div>
                <div className="p-3 rounded-lg border border-transparent focus-within:border-accent focus-within:bg-accent/10 transition-all">
                  <label className="text-sm font-medium mb-2 block">
                    Header Value
                  </label>
                  <VariableInput
                    value={auth.headerValue || ""}
                    environment={activeEnv}
                    onChange={(val) =>
                      onAuthChange({ ...auth, headerValue: val })
                    }
                    className="w-full"
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
