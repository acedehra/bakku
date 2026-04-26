import { createContext, useContext, ReactNode } from "react";
import { HttpMethod, SavedRequest, RequestFolder, AuthConfig, KVEntry, Environment } from "../types";
import { ResponseData } from "../types";

export interface AppState {
  // Request state
  method: HttpMethod;
  url: string;
  headers: KVEntry[];
  body: string;
  auth: AuthConfig;

  // Response state
  loading: boolean;
  error: string | null;
  response: ResponseData | null;

  // Saved requests state
  selectedSavedRequestId: string | null;

  // Environment state
  activeEnvId: string | null;

  // UI state
  searchQuery: string;
  expandedFolders: Set<string>;
  isEnvManagerOpen: boolean;
}

export interface AppActions {
  // Request actions
  setMethod: (method: HttpMethod) => void;
  setUrl: (url: string) => void;
  setHeaders: (headers: KVEntry[]) => void;
  setBody: (body: string) => void;
  setAuth: (auth: AuthConfig) => void;
  setParamEntries: (params: KVEntry[]) => void;

  // Response actions
  executeRequest: () => Promise<void>;
  clearError: () => void;
  clearResponse: () => void;

  // Saved request actions
  handleSavedRequestSelect: (request: SavedRequest) => void;
  handleCreateRequest: () => Promise<void>;
  handleCreateFolder: () => void;
  handleConfirmFolderName: (name: string) => void;
  handleCancelFolderName: () => void;
  handleRenameFolder: (folder: RequestFolder, newName: string) => void;
  handleRenameRequest: (request: SavedRequest, newName: string) => void;
  handleDeleteRequest: (id: string) => void;
  handleDeleteFolder: (id: string) => void;
  handleToggleFolder: (folderId: string) => void;
  handleCreateRequestInFolder?: (folderId: string) => void;
  handleMoveRequestToFolder?: (requestId: string, folderId: string | null) => void;

  // Dialog state
  folderDialogOpen: boolean;
  setFolderDialogOpen: (open: boolean) => void;

  // Environment actions
  setActiveEnvId: (id: string | null) => void;
  handleOpenEnvManager: () => void;
  handleCloseEnvManager: () => void;
  handleAddEnvironment: (name: string) => Environment;
  handleUpdateEnvironment: (env: Environment) => void;
  handleDeleteEnvironment: (id: string) => void;

  // UI actions
  setSearchQuery: (query: string) => void;
}

export interface AppContextValue extends AppState, AppActions {
  // Data collections
  savedRequests: SavedRequest[];
  folders: RequestFolder[];
  environments: Environment[];
  paramEntries: KVEntry[];

  // Panel layout
  sidebarWidth: number;
  responseWidth: number;
  handleSidebarResize: (delta: number) => void;
  handleResponseResize: (delta: number) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppContextProvider({ children, value }: { children: ReactNode; value: AppContextValue }) {
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  return context;
}
