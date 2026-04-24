import { useCallback, useEffect, useMemo, useState } from "react";
import { isTauri } from "@tauri-apps/api/core";
import * as savedLibrary from "../api/savedLibrary";
import {
  SavedRequest,
  RequestFolder,
  HttpMethod,
  AuthConfig,
  ResponseData,
  RequestHistoryItem,
} from "../types";
import { SAVED_REQUESTS_STORAGE_KEY } from "../constants";
import { HISTORY_STORAGE_KEY } from "../constants";

function buildHistoryMigrationPayload(): { folders: RequestFolder[]; requests: SavedRequest[] } | null {
  try {
    const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!storedHistory) return null;
    const history = JSON.parse(storedHistory) as RequestHistoryItem[];
    if (history.length === 0) return null;

    const folder: RequestFolder = {
      id: `folder-${Date.now()}`,
      name: "Migrated History",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const requests: SavedRequest[] = history
      .slice()
      .reverse()
      .map((item) => ({
        id: `saved-${item.id}`,
        name: `${item.method} ${new Date(item.timestamp).toLocaleString()}`,
        method: item.method,
        url: item.requestData.url,
        headers: Array.isArray(item.requestData.headers)
          ? item.requestData.headers
          : Object.entries(item.requestData.headers || {}).map(([key, value]) => ({
              id: crypto.randomUUID(),
              key,
              value,
              enabled: true,
            })),
        body: item.requestData.body,
        auth: item.requestData.auth,
        folderId: folder.id,
        createdAt: item.timestamp,
        updatedAt: item.timestamp,
      }));

    return { folders: [folder], requests: requests as SavedRequest[] };
  } catch {
    return null;
  }
}

async function tryMigrateLocalStorageToTauri(): Promise<boolean> {
  try {
    const stored = localStorage.getItem(SAVED_REQUESTS_STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored) as { requests: any[]; folders: RequestFolder[] };
      const folders = data.folders || [];
      const requests = (data.requests || []).map((r) => ({
        ...r,
        headers: Array.isArray(r.headers)
          ? r.headers
          : Object.entries(r.headers || {}).map(([key, value]) => ({
              id: crypto.randomUUID(),
              key,
              value,
              enabled: true,
            })),
      }));
      
      if (folders.length > 0 || requests.length > 0) {
        await savedLibrary.importLibrary(folders, requests as SavedRequest[]);
        localStorage.removeItem(SAVED_REQUESTS_STORAGE_KEY);
        return true;
      }
    }
  } catch (err) {
    console.error("Failed to migrate saved requests from localStorage to SQLite", err);
  }

  const fromHistory = buildHistoryMigrationPayload();
  if (fromHistory && (fromHistory.folders.length > 0 || fromHistory.requests.length > 0)) {
    try {
      await savedLibrary.importLibrary(fromHistory.folders, fromHistory.requests);
      return true;
    } catch (err) {
      console.error("Failed to migrate history to SQLite", err);
    }
  }
  return false;
}

export function useSavedRequests() {
  const tauriMode = useMemo(() => isTauri(), []);
  const [savedRequests, setSavedRequests] = useState<SavedRequest[]>([]);
  const [folders, setFolders] = useState<RequestFolder[]>([]);
  const [libraryReady, setLibraryReady] = useState(false);

  const refreshFromDb = useCallback(async () => {
    const lib = await savedLibrary.getLibrary();
    setFolders(lib.folders);
    setSavedRequests(lib.requests);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function initTauri() {
      try {
        let lib = await savedLibrary.getLibrary();
        if (lib.folders.length === 0 && lib.requests.length === 0) {
          const migrated = await tryMigrateLocalStorageToTauri();
          if (migrated) {
            lib = await savedLibrary.getLibrary();
          }
        }
        if (!cancelled) {
          setFolders(lib.folders);
          setSavedRequests(lib.requests);
        }
      } catch (err) {
        console.error("Failed to load saved library from SQLite", err);
      } finally {
        if (!cancelled) setLibraryReady(true);
      }
    }

    function initLocal() {
      try {
        const stored = localStorage.getItem(SAVED_REQUESTS_STORAGE_KEY);
        if (stored) {
          const data = JSON.parse(stored) as { requests: SavedRequest[]; folders: RequestFolder[] };
          setSavedRequests(data.requests || []);
          setFolders(data.folders || []);
        } else {
          const fromHistory = buildHistoryMigrationPayload();
          if (fromHistory) {
            setFolders(fromHistory.folders);
            setSavedRequests(fromHistory.requests);
          }
        }
      } catch (err) {
        console.error("Failed to load saved requests from localStorage", err);
      } finally {
        setLibraryReady(true);
      }
    }

    if (tauriMode) {
      void initTauri();
    } else {
      initLocal();
    }

    return () => {
      cancelled = true;
    };
  }, [tauriMode]);

  useEffect(() => {
    if (tauriMode) return;
    try {
      localStorage.setItem(
        SAVED_REQUESTS_STORAGE_KEY,
        JSON.stringify({ requests: savedRequests, folders })
      );
    } catch (err) {
      console.error("Failed to save saved requests to localStorage", err);
    }
  }, [savedRequests, folders, tauriMode]);

  const createRequest = async (
    name: string,
    folderId: string | null = null
  ): Promise<SavedRequest> => {
    const newRequest: SavedRequest = {
      id: `saved-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name,
      method: "GET",
      url: "",
      headers: [],
      body: "",
      auth: { type: "None" },
      folderId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    if (tauriMode) {
      await savedLibrary.createRequest(newRequest);
      await refreshFromDb();
    } else {
      setSavedRequests((prev) => [...prev, newRequest]);
    }
    return newRequest;
  };

  const updateRequest = async (updatedRequest: SavedRequest): Promise<void> => {
    const next: SavedRequest = { ...updatedRequest, updatedAt: Date.now() };
    if (tauriMode) {
      await savedLibrary.updateRequest(next);
      await refreshFromDb();
    } else {
      setSavedRequests((prev) =>
        prev.map((req) => (req.id === next.id ? next : req))
      );
    }
  };

  const deleteRequest = async (id: string): Promise<void> => {
    if (tauriMode) {
      await savedLibrary.deleteRequest(id);
      await refreshFromDb();
    } else {
      setSavedRequests((prev) => prev.filter((req) => req.id !== id));
    }
  };

  const createFolder = async (name: string): Promise<RequestFolder> => {
    const newFolder: RequestFolder = {
      id: `folder-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    if (tauriMode) {
      await savedLibrary.createFolder(newFolder);
      await refreshFromDb();
    } else {
      setFolders((prev) => [...prev, newFolder]);
    }
    return newFolder;
  };

  const updateFolder = async (updatedFolder: RequestFolder): Promise<void> => {
    const next: RequestFolder = { ...updatedFolder, updatedAt: Date.now() };
    if (tauriMode) {
      await savedLibrary.updateFolder(next);
      await refreshFromDb();
    } else {
      setFolders((prev) =>
        prev.map((folder) => (folder.id === next.id ? next : folder))
      );
    }
  };

  const deleteFolder = async (id: string): Promise<void> => {
    if (tauriMode) {
      await savedLibrary.deleteFolder(id);
      await refreshFromDb();
    } else {
      setFolders((prev) => prev.filter((folder) => folder.id !== id));
      setSavedRequests((prev) =>
        prev.map((req) => (req.folderId === id ? { ...req, folderId: null } : req))
      );
    }
  };

  const getRequestById = (id: string): SavedRequest | undefined =>
    savedRequests.find((req) => req.id === id);

  const autoSaveRequest = async (
    id: string,
    data: {
      method: HttpMethod;
      url: string;
      headers: KVEntry[];
      body: string;
      auth: AuthConfig;
    },
    lastResponse?: ResponseData
  ): Promise<void> => {
    const existingRequest = getRequestById(id);
    if (!existingRequest) return;

    const updated: SavedRequest = {
      ...existingRequest,
      ...data,
      updatedAt: Date.now(),
    };
    if (lastResponse !== undefined) {
      updated.lastResponse = lastResponse;
    }

    if (tauriMode) {
      await savedLibrary.updateRequest(updated);
      await refreshFromDb();
    } else {
      setSavedRequests((prev) =>
        prev.map((req) => (req.id === id ? updated : req))
      );
    }
  };

  return {
    savedRequests,
    folders,
    libraryReady,
    createRequest,
    updateRequest,
    deleteRequest,
    createFolder,
    updateFolder,
    deleteFolder,
    getRequestById,
    autoSaveRequest,
  };
}
