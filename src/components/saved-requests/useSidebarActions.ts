import { useState, useCallback, useRef } from "react";
import { confirm } from "@tauri-apps/plugin-dialog";
import { SavedRequest, RequestFolder } from "../../types";

export interface SidebarActions {
  createMenuOpen: boolean;
  setCreateMenuOpen: (open: boolean) => void;
  createMenuRef: React.RefObject<HTMLDivElement | null>;
  renamingFolderId: string | null;
  renamingRequestId: string | null;
  renameValue: string;
  setRenameValue: (value: string) => void;
  handleStartRenameFolder: (folder: RequestFolder, e: React.MouseEvent) => void;
  handleStartRenameRequest: (request: SavedRequest, e: React.MouseEvent) => void;
  handleSaveRename: (
    e: React.KeyboardEvent,
    folders: RequestFolder[],
    requests: SavedRequest[],
    onRenameFolder?: (folder: RequestFolder, newName: string) => void,
    onRenameRequest?: (request: SavedRequest, newName: string) => void
  ) => void;
  handleBlurRename: () => void;
  handleDeleteFolder: (id: string, e: React.MouseEvent, onDeleteFolder: (id: string) => void) => Promise<void>;
  handleDeleteRequest: (id: string, e: React.MouseEvent, onDeleteRequest: (id: string) => void) => Promise<void>;
}

export function useSidebarActions(): SidebarActions {
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const createMenuRef = useRef<HTMLDivElement | null>(null);
  const [renamingFolderId, setRenamingFolderId] = useState<string | null>(null);
  const [renamingRequestId, setRenamingRequestId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const handleStartRenameFolder = useCallback((folder: RequestFolder, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingFolderId(folder.id);
    setRenameValue(folder.name);
  }, []);

  const handleStartRenameRequest = useCallback((request: SavedRequest, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingRequestId(request.id);
    setRenameValue(request.name);
  }, []);

  const handleSaveRename = useCallback((
    e: React.KeyboardEvent,
    folders: RequestFolder[],
    requests: SavedRequest[],
    onRenameFolder?: (folder: RequestFolder, newName: string) => void,
    onRenameRequest?: (request: SavedRequest, newName: string) => void
  ) => {
    if (e.key === "Enter" && renameValue.trim()) {
      if (renamingFolderId && onRenameFolder) {
        const folder = folders.find((f) => f.id === renamingFolderId);
        if (folder) {
          onRenameFolder(folder, renameValue.trim());
        }
      } else if (renamingRequestId && onRenameRequest) {
        const request = requests.find((r) => r.id === renamingRequestId);
        if (request) {
          onRenameRequest(request, renameValue.trim());
        }
      }
      setRenamingFolderId(null);
      setRenamingRequestId(null);
      setRenameValue("");
    } else if (e.key === "Escape") {
      setRenamingFolderId(null);
      setRenamingRequestId(null);
      setRenameValue("");
    }
  }, [renameValue, renamingFolderId, renamingRequestId]);

  const handleBlurRename = useCallback(() => {
    setTimeout(() => {
      setRenamingFolderId(null);
      setRenamingRequestId(null);
      setRenameValue("");
    }, 100);
  }, []);

  const handleDeleteFolder = useCallback(async (
    id: string,
    e: React.MouseEvent,
    onDeleteFolder: (id: string) => void
  ) => {
    e.stopPropagation();
    const confirmed = await confirm("Delete this folder and move all its requests to root?", {
      title: "Confirm Delete",
      kind: "warning",
    });
    if (confirmed) {
      onDeleteFolder(id);
    }
  }, []);

  const handleDeleteRequest = useCallback(async (
    id: string,
    e: React.MouseEvent,
    onDeleteRequest: (id: string) => void
  ) => {
    e.stopPropagation();
    const confirmed = await confirm("Delete this request?", {
      title: "Confirm Delete",
      kind: "warning",
    });
    if (confirmed) {
      onDeleteRequest(id);
    }
  }, []);

  return {
    createMenuOpen,
    setCreateMenuOpen,
    createMenuRef,
    renamingFolderId,
    renamingRequestId,
    renameValue,
    setRenameValue,
    handleStartRenameFolder,
    handleStartRenameRequest,
    handleSaveRename,
    handleBlurRename,
    handleDeleteFolder,
    handleDeleteRequest,
  };
}
