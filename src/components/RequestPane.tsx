import { useState, useRef, useEffect } from "react";
import { RequestData, HttpMethod, AuthType, Environment } from "../types";
import { Trash2, FileText, List, Settings2, ShieldCheck, Eye, EyeOff, Settings, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VariableInput } from "./VariableInput";

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
  environments,
  activeEnvId,
  onActiveEnvChange,
  onOpenEnvManager,
}: RequestPaneProps) {
  const [activeTab, setActiveTab] = useState<RequestTab>("Body");
  const paramKeyInputRefs = useRef<Map<number, HTMLInputElement>>(new Map());
  const headerKeyInputRefs = useRef<Map<number, HTMLInputElement>>(new Map());
  const [focusedParamIndex, setFocusedParamIndex] = useState<number | null>(null);
  const [focusedHeaderIndex, setFocusedHeaderIndex] = useState<number | null>(null);
  const [paramCursorPos, setParamCursorPos] = useState<number | null>(null);
  const [headerCursorPos, setHeaderCursorPos] = useState<number | null>(null);
  const [justAddedParam, setJustAddedParam] = useState(false);
  const [justAddedHeader, setJustAddedHeader] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showToken, setShowToken] = useState(false);

  const activeEnv = environments.find(e => e.id === activeEnvId) || null;

  const canHaveBody = method !== "GET" && method !== "HEAD";

  // Restore focus for params after state update
  useEffect(() => {
    if (focusedParamIndex !== null) {
      const input = paramKeyInputRefs.current.get(focusedParamIndex);
      if (input) {
        input.focus();
        if (paramCursorPos !== null) {
          input.setSelectionRange(paramCursorPos, paramCursorPos);
        }
        setFocusedParamIndex(null);
        setParamCursorPos(null);
      }
    } else if (justAddedParam) {
      // Focus the first empty key input after adding a new param
      const entries = Object.entries(params);
      const emptyKeyIndex = entries.findIndex(([key]) => key === "");
      if (emptyKeyIndex !== -1) {
        const input = paramKeyInputRefs.current.get(emptyKeyIndex);
        if (input) {
          input.focus();
        }
      }
      setJustAddedParam(false);
    }
  }, [params, focusedParamIndex, paramCursorPos, justAddedParam]);

  // Restore focus for headers after state update
  useEffect(() => {
    if (focusedHeaderIndex !== null) {
      const input = headerKeyInputRefs.current.get(focusedHeaderIndex);
      if (input) {
        input.focus();
        if (headerCursorPos !== null) {
          input.setSelectionRange(headerCursorPos, headerCursorPos);
        }
        setFocusedHeaderIndex(null);
        setHeaderCursorPos(null);
      }
    } else if (justAddedHeader) {
      // Focus the first empty key input after adding a new header
      const entries = Object.entries(headers);
      const emptyKeyIndex = entries.findIndex(([key]) => key === "");
      if (emptyKeyIndex !== -1) {
        const input = headerKeyInputRefs.current.get(emptyKeyIndex);
        if (input) {
          input.focus();
        }
      }
      setJustAddedHeader(false);
    }
  }, [headers, focusedHeaderIndex, headerCursorPos, justAddedHeader]);

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
    setJustAddedHeader(true);
    onHeadersChange({ ...headers, "": "" });
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
    setJustAddedParam(true);
    onParamsChange({ ...params, "": "" });
  };

  const deleteParam = (key: string) => {
    const newParams = { ...params };
    delete newParams[key];
    onParamsChange(newParams);
  };

  const tabs: RequestTab[] = ["Body", "Params", "Headers", "Auth"];

  const tabIcons: Record<RequestTab, React.ReactNode> = {
    Body: <FileText size={14} />,
    Params: <List size={14} />,
    Headers: <Settings2 size={14} />,
    Auth: <ShieldCheck size={14} />,
  };

  const paramCount = Object.keys(params).filter(k => k.trim() !== "").length;
  const headerCount = Object.keys(headers).filter(k => k.trim() !== "").length;

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
          <div className="space-y-2">
            {Object.entries(params).map(([key, value], index) => (
              <div key={`param-${index}-${key}`} className="flex gap-2 items-center group p-1.5 rounded-md hover:bg-accent/30 focus-within:bg-accent/40 transition-colors">
                <VariableInput
                  ref={(el) => {
                    if (el) {
                      paramKeyInputRefs.current.set(index, el as HTMLInputElement);
                    }
                  }}
                  placeholder="Key"
                  value={key}
                  environment={activeEnv}
                  onChange={(val) => {
                    const input = paramKeyInputRefs.current.get(index);
                    const cursorPos = input?.selectionStart ?? null;
                    const newParams = { ...params };
                    delete newParams[key];
                    newParams[val] = value;
                    onParamsChange(newParams);
                    // Update cursor status tracking
                    setFocusedParamIndex(index);
                    setParamCursorPos(cursorPos);
                  }}
                  className="flex-1"
                />
                <VariableInput
                  placeholder="Value"
                  value={value}
                  environment={activeEnv}
                  onChange={(val) => updateParam(key, val)}
                  className="flex-1"
                />
                <Button
                  onClick={() => deleteParam(key)}
                  variant="outline" size="icon" aria-label="Delete param" title="Delete param">
                  <Trash2 />
                </Button>
              </div>
            ))}
            <button
              onClick={addParam}
              className="px-4 py-2 text-sm font-medium rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              + Add Param
            </button>
          </div>
        )}
        {activeTab === "Headers" && (
          <div className="space-y-2">
            {Object.entries(headers).map(([key, value], index) => (
              <div key={`header-${index}-${key}`} className="flex gap-2 items-center group p-1.5 rounded-md hover:bg-accent/30 focus-within:bg-accent/40 transition-colors">
                <VariableInput
                  ref={(el) => {
                    if (el) {
                      headerKeyInputRefs.current.set(index, el as HTMLInputElement);
                    }
                  }}
                  placeholder="Header name"
                  value={key}
                  environment={activeEnv}
                  onChange={(val) => {
                    const input = headerKeyInputRefs.current.get(index);
                    const cursorPos = input?.selectionStart ?? null;
                    const newHeaders = { ...headers };
                    delete newHeaders[key];
                    newHeaders[val] = value;
                    onHeadersChange(newHeaders);
                    setFocusedHeaderIndex(index);
                    setHeaderCursorPos(cursorPos);
                  }}
                  className="flex-1"
                />
                <VariableInput
                  placeholder="Header value"
                  value={value}
                  environment={activeEnv}
                  onChange={(val) => updateHeader(key, val)}
                  className="flex-1"
                />

                <Button
                  onClick={() => deleteHeader(key)}
                  variant="outline" size="icon" aria-label="Delete header" title="Delete header">

                  <Trash2 />
                </Button>
              </div>
            ))}
            <button
              onClick={addHeader}
              className="px-4 py-2 text-sm font-medium rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
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
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
