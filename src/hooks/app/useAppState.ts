import { useEffect, useState, useCallback } from "react";
import { HttpMethod, SavedRequest, RequestFolder, AuthConfig, KVEntry, Environment } from "../../types";
import { usePanelResize } from "../usePanelResize";
import { useSavedRequests } from "../useSavedRequests";
import { useUrl } from "../useUrlParams";
import { useRequestExecution } from "../useRequestExecution";
import { useSavedRequestsManager } from "../useSavedRequestsManager";
import { useEnvironments } from "../useEnvironments";
import { AppContextValue } from "../../contexts/AppContext";

export function useAppState(): AppContextValue {
  // Panel resize state
  const {
    sidebarWidth,
    responseWidth,
    handleSidebarResize,
    handleResponseResize,
  } = usePanelResize();

  // Saved requests state
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

  // URL state
  const {
    url,
    setUrl,
    paramEntries,
    setParamEntries,
  } = useUrl("https://jsonplaceholder.typicode.com/todos/1");

  // Environment state
  const {
    environments,
    activeEnvId,
    activeEnv,
    setActiveEnvId,
    addEnvironment,
    updateEnvironment,
    deleteEnvironment,
  } = useEnvironments();

  // UI state
  const [isEnvManagerOpen, setIsEnvManagerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  // Request state
  const [method, setMethod] = useState<HttpMethod>("GET");
  const [headers, setHeaders] = useState<KVEntry[]>([]);
  const [body, setBody] = useState("");
  const [auth, setAuth] = useState<AuthConfig>({ type: "None" });

  // Request execution state
  const {
    loading,
    error,
    response,
    executeRequest,
    clearError,
    clearResponse,
  } = useRequestExecution();

  // Saved request selection
  const {
    selectedSavedRequestId,
    handleSavedRequestSelect,
  } = useSavedRequestsManager({
    setMethod,
    setUrl,
    setHeaders,
    setBody,
    setAuth,
    clearResponse,
    clearError,
  });

  // Apply dark theme
  useEffect(() => {
    document.documentElement.classList.add("dark");
    return () => {
      document.documentElement.classList.remove("dark");
    };
  }, []);

  // Action handlers
  const handleCreateRequest = useCallback(async () => {
    const newRequest = await createRequest("New Request");
    handleSavedRequestSelect(newRequest);
  }, [createRequest, handleSavedRequestSelect]);

  // Dialog state
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);

  const handleCreateFolder = useCallback(() => {
    setFolderDialogOpen(true);
  }, []);

  const handleConfirmFolderName = useCallback(
    (name: string) => {
      setFolderDialogOpen(false);
      void createFolder(name);
    },
    [createFolder]
  );

  const handleCancelFolderName = useCallback(() => {
    setFolderDialogOpen(false);
  }, []);

  const handleRenameFolder = useCallback((folder: RequestFolder, newName: string) => {
    void updateFolder({ ...folder, name: newName });
  }, [updateFolder]);

  const handleRenameRequest = useCallback((request: SavedRequest, newName: string) => {
    void updateRequest({ ...request, name: newName });
  }, [updateRequest]);

  const handleDeleteRequest = useCallback((id: string) => {
    void deleteRequest(id);
  }, [deleteRequest]);

  const handleDeleteFolder = useCallback((id: string) => {
    void deleteFolder(id);
  }, [deleteFolder]);

  const handleToggleFolder = useCallback((folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  }, []);

  const handleExecuteRequest = useCallback(async () => {
    const responseData = await executeRequest(method, url, headers, body, auth, activeEnv ?? null);

    if (selectedSavedRequestId) {
      if (responseData) {
        await autoSaveRequest(
          selectedSavedRequestId,
          {
            method,
            url,
            headers,
            body,
            auth,
          },
          responseData
        );
      } else {
        await autoSaveRequest(selectedSavedRequestId, {
          method,
          url,
          headers,
          body,
          auth,
        });
      }
    }
  }, [method, url, headers, body, auth, activeEnv, selectedSavedRequestId, executeRequest, autoSaveRequest]);

  const handleOpenEnvManager = useCallback(() => {
    setIsEnvManagerOpen(true);
  }, []);

  const handleCloseEnvManager = useCallback(() => {
    setIsEnvManagerOpen(false);
  }, []);

  const handleAddEnvironment = useCallback((name: string): Environment => {
    return addEnvironment(name);
  }, [addEnvironment]);

  const handleUpdateEnvironment = useCallback((env: Environment) => {
    updateEnvironment(env);
  }, [updateEnvironment]);

  const handleDeleteEnvironment = useCallback((id: string) => {
    deleteEnvironment(id);
  }, [deleteEnvironment]);

  return {
    // State
    method,
    url,
    headers,
    body,
    auth,
    loading,
    error,
    response,
    selectedSavedRequestId,
    activeEnvId,
    searchQuery,
    expandedFolders,
    isEnvManagerOpen,
    savedRequests,
    folders,
    environments,
    paramEntries,
    sidebarWidth,
    responseWidth,
    handleSidebarResize,
    handleResponseResize,
    // Actions
    setMethod,
    setUrl,
    setHeaders,
    setBody,
    setAuth,
    setParamEntries,
    executeRequest: handleExecuteRequest,
    clearError,
    clearResponse,
    handleSavedRequestSelect,
    handleCreateRequest,
    handleCreateFolder,
    handleConfirmFolderName,
    handleCancelFolderName,
    handleRenameFolder,
    handleRenameRequest,
    handleDeleteRequest,
    handleDeleteFolder,
    handleToggleFolder,
    setActiveEnvId,
    handleOpenEnvManager,
    handleCloseEnvManager,
    handleUpdateEnvironment,
    handleDeleteEnvironment,
    handleAddEnvironment,
    setSearchQuery,
    // Dialog state
    folderDialogOpen,
    setFolderDialogOpen,
  };
}
