import { useEffect, useState } from "react";
import "./App.css";
import { SavedRequestsSidebar } from "./components/SavedRequestsSidebar";
import { RequestPane } from "./components/RequestPane";
import { ResponsePane } from "./components/ResponsePane";
import { ResizeHandle } from "./components/ResizeHandle";
import {
  HttpMethod,
  SavedRequest,
  RequestFolder,
  AuthConfig,
} from "./types";
import { usePanelResize } from "./hooks/usePanelResize";
import { useSavedRequests } from "./hooks/useSavedRequests";
import { useUrlParams } from "./hooks/useUrlParams";
import { useRequestExecution } from "./hooks/useRequestExecution";
import { useSavedRequestsManager } from "./hooks/useSavedRequestsManager";
import { getBaseUrl } from "./utils/urlParser";
import { useEnvironments } from "./hooks/useEnvironments";
import { EnvironmentManager } from "./components/EnvironmentManager";

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
    savedRequests,
    folders,
    createRequest,
    updateRequest,
    deleteRequest,
    createFolder,
    updateFolder,
    deleteFolder,
    autoSaveRequest,
  } = useSavedRequests();

  const {
    url,
    setUrl,
    params,
    setParams,
    updateFromHistory,
  } = useUrlParams("https://jsonplaceholder.typicode.com/todos/1");

  const {
    environments,
    activeEnvId,
    activeEnv,
    setActiveEnvId,
    addEnvironment,
    updateEnvironment,
    deleteEnvironment,
  } = useEnvironments();

  const [isEnvManagerOpen, setIsEnvManagerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const [method, setMethod] = useState<HttpMethod>("GET");
  const [headers, setHeaders] = useState<Record<string, string>>({});
  const [body, setBody] = useState("");
  const [auth, setAuth] = useState<AuthConfig>({ type: "None" });

  const {
    loading,
    error,
    response,
    executeRequest,
    clearError,
    clearResponse,
  } = useRequestExecution();

  const {
    selectedSavedRequestId,
    handleSavedRequestSelect,
  } = useSavedRequestsManager({
    setMethod,
    updateFromHistory,
    setHeaders,
    setBody,
    setAuth,
    clearResponse,
    clearError,
  });

  const handleCreateRequest = async () => {
    const newRequest = await createRequest("New Request");
    handleSavedRequestSelect(newRequest);
  };

  const handleCreateFolder = () => {
    const name = prompt("Enter folder name:");
    if (name && name.trim()) {
      void createFolder(name.trim());
    }
  };

  const handleRenameFolder = (folder: RequestFolder, newName: string) => {
    void updateFolder({ ...folder, name: newName });
  };

  const handleRenameRequest = (request: SavedRequest, newName: string) => {
    void updateRequest({ ...request, name: newName });
  };

  const handleToggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  async function sendRequest() {
    const responseData = await executeRequest(method, url, headers, body, auth, activeEnv);

    if (selectedSavedRequestId) {
      const baseUrl = getBaseUrl(url);
      if (responseData) {
        await autoSaveRequest(
          selectedSavedRequestId,
          {
            method,
            url: baseUrl,
            headers,
            params,
            body,
            auth,
          },
          responseData
        );
      } else {
        await autoSaveRequest(selectedSavedRequestId, {
          method,
          url: baseUrl,
          headers,
          params,
          body,
          auth,
        });
      }
    }
  }

  return (
    <div className="h-screen bg-background text-foreground flex overflow-hidden">
      <div style={{ width: `${sidebarWidth}px` }} className="h-screen flex-shrink-0">
        <SavedRequestsSidebar
          savedRequests={savedRequests}
          folders={folders}
          selectedRequestId={selectedSavedRequestId}
          expandedFolders={expandedFolders}
          searchQuery={searchQuery}
          onSelectRequest={handleSavedRequestSelect}
          onCreateRequest={handleCreateRequest}
          onCreateFolder={handleCreateFolder}
          onDeleteRequest={(id) => {
            void deleteRequest(id);
          }}
          onDeleteFolder={(id) => {
            void deleteFolder(id);
          }}
          onToggleFolder={handleToggleFolder}
          onSearchChange={setSearchQuery}
          onRenameFolder={handleRenameFolder}
          onRenameRequest={handleRenameRequest}
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
        environments={environments}
        activeEnvId={activeEnvId}
        onActiveEnvChange={setActiveEnvId}
        onOpenEnvManager={() => setIsEnvManagerOpen(true)}
      />
      <ResizeHandle onResize={handleResponseResize} />
      <div style={{ width: `${responseWidth}px` }} className="h-screen flex-shrink-0">
        <ResponsePane response={response} error={error} loading={loading} />
      </div>

      {isEnvManagerOpen && (
        <EnvironmentManager
          environments={environments}
          onAdd={addEnvironment}
          onUpdate={updateEnvironment}
          onDelete={deleteEnvironment}
          onClose={() => setIsEnvManagerOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
