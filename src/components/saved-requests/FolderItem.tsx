import { memo } from "react";
import * as ContextMenu from "@radix-ui/react-context-menu";
import { useDroppable } from "@dnd-kit/core";
import { Pencil, Trash2, Folder, FolderOpen, ChevronRight, ChevronDown } from "lucide-react";
import { RequestFolder, SavedRequest, HttpMethod } from "../../types";
import RequestItem from "./RequestItem";
import { RightClickMenu } from "../ui/RightClickMenu";

interface FolderItemProps {
  folder: RequestFolder;
  isExpanded: boolean;
  onToggle: (folderId: string) => void;
  onRequestSelect: (request: SavedRequest) => void;
  requests: SavedRequest[];
  selectedRequestId: string | null;
  renamingFolderId: string | null;
  renamingRequestId: string | null;
  renameValue: string;
  setRenameValue: (value: string) => void;
  onSaveRename: (e: React.KeyboardEvent) => void;
  onBlurRename: () => void;
  onStartRenameFolder: (folder: RequestFolder, e: React.MouseEvent) => void;
  onStartRenameRequest: (request: SavedRequest, e: React.MouseEvent) => void;
  onDeleteFolder: (id: string, e: React.MouseEvent) => void;
  onDeleteRequest: (id: string, e: React.MouseEvent) => void;
  onAddRequestToFolder?: (folderId: string) => void;
  getMethodColor: (method: HttpMethod) => string;
  truncateName: (name: string, maxLength?: number) => string;
}

function FolderItem({
  folder,
  isExpanded,
  onToggle,
  onRequestSelect,
  requests,
  selectedRequestId,
  renamingFolderId,
  renamingRequestId,
  renameValue,
  setRenameValue,
  onSaveRename,
  onBlurRename,
  onStartRenameFolder,
  onStartRenameRequest,
  onDeleteFolder,
  onDeleteRequest,
  onAddRequestToFolder,
  getMethodColor,
  truncateName,
}: FolderItemProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `folder-${folder.id}`,
    data: {
      type: 'folder',
      folderId: folder.id,
    },
  });

  const folderRequests = requests.filter((req) => req.folderId === folder.id);

  return (
    <div className="mb-1">
      <RightClickMenu
        items={[
          {
            id: 'rename',
            label: 'Rename',
            icon: <Pencil className="w-4 h-4" />,
            onSelect: () => onStartRenameFolder(folder, { stopPropagation: () => {} } as React.MouseEvent),
          },
          {
            id: 'add-request',
            label: 'Add Request',
            icon: <ContextMenu.Separator />,
            onSelect: () => onAddRequestToFolder?.(folder.id),
          },
          {
            id: 'delete',
            label: 'Delete',
            icon: <Trash2 className="w-4 h-4" />,
            destructive: true,
            onSelect: () => onDeleteFolder(folder.id, { stopPropagation: () => {} } as React.MouseEvent),
          },
        ]}
        disabled={renamingFolderId === folder.id}
      >
        <div
          ref={setNodeRef}
          className={`flex items-center gap-1 p-1 rounded-md hover:bg-accent/30 cursor-pointer group transition-colors ${
            isOver ? "bg-accent/60" : ""
          }`}
          onClick={() => onToggle(folder.id)}
        >
          <span className="text-muted-foreground w-4 flex items-center justify-center">
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
          {renamingFolderId === folder.id ? (
            <input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={onSaveRename}
              onBlur={onBlurRename}
              onClick={(e) => e.stopPropagation()}
              autoFocus
              className="flex-1 h-6 px-1 text-xs bg-background border border-input rounded focus:outline-none focus:ring-2 focus:ring-ring"
            />
          ) : (
            <>
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <span className="text-muted-foreground">
                  {isExpanded ? <FolderOpen size={14} /> : <Folder size={14} />}
                </span>
                <span className="text-xs font-medium text-foreground truncate">
                  {truncateName(folder.name)}
                </span>
              </div>
            </>
          )}
        </div>
      </RightClickMenu>

      {/* Folder requests */}
      {isExpanded && (
        <div className="ml-4">
          {folderRequests.length === 0 ? (
            <div className="p-2 text-xs text-muted-foreground">No requests in this folder</div>
          ) : (
            folderRequests.map((request) => (
              <RequestItem
                key={request.id}
                request={request}
                selected={selectedRequestId === request.id}
                onSelect={onRequestSelect}
                renaming={renamingRequestId === request.id}
                renameValue={renameValue}
                setRenameValue={setRenameValue}
                onSaveRename={onSaveRename}
                onBlurRename={onBlurRename}
                onStartRename={onStartRenameRequest}
                onDelete={onDeleteRequest}
                getMethodColor={getMethodColor}
                truncateName={truncateName}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default memo(FolderItem);
