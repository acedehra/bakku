import { useCallback } from "react";
import { SavedRequest, RequestFolder, HttpMethod } from "../types";
import { SidebarSearch } from "./saved-requests/SidebarSearch";
import { SidebarCreateMenu } from "./saved-requests/SidebarCreateMenu";
import { useRequestFilter } from "./saved-requests/useRequestFilter";
import { useSidebarActions } from "./saved-requests/useSidebarActions";
import { useDebounce } from "../hooks/useDebounce";
import FolderItem from "./saved-requests/FolderItem";
import RequestItem from "./saved-requests/RequestItem";

interface SavedRequestsSidebarProps {
  savedRequests: SavedRequest[];
  folders: RequestFolder[];
  selectedRequestId: string | null;
  expandedFolders: Set<string>;
  searchQuery: string;
  onSelectRequest: (request: SavedRequest) => void;
  onCreateRequest: () => void;
  onCreateFolder: () => void;
  onDeleteRequest: (id: string) => void;
  onDeleteFolder: (id: string) => void;
  onToggleFolder: (folderId: string) => void;
  onSearchChange: (query: string) => void;
  onRenameFolder?: (folder: RequestFolder, newName: string) => void;
  onRenameRequest?: (request: SavedRequest, newName: string) => void;
}

export function SavedRequestsSidebar({
  savedRequests,
  folders,
  selectedRequestId,
  expandedFolders,
  searchQuery,
  onSelectRequest,
  onCreateRequest,
  onCreateFolder,
  onDeleteRequest,
  onDeleteFolder,
  onToggleFolder,
  onSearchChange,
  onRenameFolder,
  onRenameRequest,
}: SavedRequestsSidebarProps) {
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const filteredData = useRequestFilter(savedRequests, folders, debouncedSearchQuery);
  const sidebarActions = useSidebarActions();

  const getMethodColor = useCallback((method: HttpMethod): string => {
    switch (method) {
      case "GET":
        return "text-green-500";
      case "POST":
        return "text-blue-500";
      case "PUT":
        return "text-yellow-500";
      case "PATCH":
        return "text-orange-500";
      case "DELETE":
        return "text-red-500";
      case "HEAD":
        return "text-purple-500";
      default:
        return "text-muted-foreground";
    }
  }, []);

  const truncateName = useCallback((name: string, maxLength: number = 25): string => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + "...";
  }, []);

  const handleSaveRename = useCallback((e: React.KeyboardEvent) => {
    sidebarActions.handleSaveRename(e, folders, savedRequests, onRenameFolder, onRenameRequest);
  }, [sidebarActions, folders, savedRequests, onRenameFolder, onRenameRequest]);

  const handleBlurRename = useCallback(() => {
    sidebarActions.handleBlurRename();
  }, [sidebarActions]);

  const rootRequests = filteredData.requests.filter((req) => !req.folderId);

  return (
    <div className="w-full h-screen flex flex-col bg-background border-r border-border">
      <SidebarSearch value={searchQuery} onChange={onSearchChange} />
      {/* Note: Search filtering is debounced via debouncedSearchQuery for performance */}

      <SidebarCreateMenu
        open={sidebarActions.createMenuOpen}
        onToggle={() => sidebarActions.setCreateMenuOpen(!sidebarActions.createMenuOpen)}
        onClose={() => sidebarActions.setCreateMenuOpen(false)}
        onCreateRequest={onCreateRequest}
        onCreateFolder={onCreateFolder}
      />

      <div className="flex-1 overflow-y-auto">
        {filteredData.requests.length === 0 && filteredData.folders.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            {searchQuery ? "No results found" : "No saved requests yet"}
          </div>
        ) : (
          <div className="p-2">
            {filteredData.folders.map((folder) => (
              <FolderItem
                key={folder.id}
                folder={folder}
                isExpanded={expandedFolders.has(folder.id)}
                onToggle={onToggleFolder}
                onRequestSelect={onSelectRequest}
                requests={filteredData.requests}
                selectedRequestId={selectedRequestId}
                renamingFolderId={sidebarActions.renamingFolderId}
                renamingRequestId={sidebarActions.renamingRequestId}
                renameValue={sidebarActions.renameValue}
                setRenameValue={sidebarActions.setRenameValue}
                onSaveRename={handleSaveRename}
                onBlurRename={handleBlurRename}
                onStartRenameFolder={sidebarActions.handleStartRenameFolder}
                onStartRenameRequest={sidebarActions.handleStartRenameRequest}
                onDeleteFolder={(id, e) => sidebarActions.handleDeleteFolder(id, e, onDeleteFolder)}
                onDeleteRequest={(id, e) => sidebarActions.handleDeleteRequest(id, e, onDeleteRequest)}
                getMethodColor={getMethodColor}
                truncateName={truncateName}
              />
            ))}

            {rootRequests.length > 0 && (
              <div className="mt-2">
                {searchQuery && filteredData.folders.length > 0 && (
                  <div className="px-2 py-1 text-xs font-medium text-muted-foreground">Uncategorized</div>
                )}
                {rootRequests.map((request) => (
                  <RequestItem
                    key={request.id}
                    request={request}
                    selected={selectedRequestId === request.id}
                    onSelect={onSelectRequest}
                    renaming={sidebarActions.renamingRequestId === request.id}
                    renameValue={sidebarActions.renameValue}
                    setRenameValue={sidebarActions.setRenameValue}
                    onSaveRename={handleSaveRename}
                    onBlurRename={handleBlurRename}
                    onStartRename={sidebarActions.handleStartRenameRequest}
                    onDelete={(id, e) => sidebarActions.handleDeleteRequest(id, e, onDeleteRequest)}
                    getMethodColor={getMethodColor}
                    truncateName={truncateName}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
