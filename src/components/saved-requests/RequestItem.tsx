import React, { useCallback, memo } from "react";
import { useDraggable } from "@dnd-kit/core";
import { Pencil, Trash2 } from "lucide-react";
import { SavedRequest, HttpMethod } from "../../types";
import { RightClickMenu } from "../ui/RightClickMenu";

interface RequestItemProps {
  request: SavedRequest;
  selected: boolean;
  onSelect: (request: SavedRequest) => void;
  renaming: boolean;
  renameValue: string;
  setRenameValue: (value: string) => void;
  onSaveRename: (e: React.KeyboardEvent) => void;
  onBlurRename: () => void;
  onStartRename: (request: SavedRequest, e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  getMethodColor: (method: HttpMethod) => string;
  truncateName: (name: string, maxLength?: number) => string;
}

function RequestItem({
  request,
  selected,
  onSelect,
  renaming,
  renameValue,
  setRenameValue,
  onSaveRename,
  onBlurRename,
  onStartRename,
  onDelete,
  getMethodColor,
  truncateName,
}: RequestItemProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: request.id,
    data: {
      type: 'request',
      requestId: request.id,
    },
  });

  const handleClick = useCallback(() => {
    onSelect(request);
  }, [request, onSelect]);

  const handleStartRename = useCallback(() => {
    onStartRename(request, { stopPropagation: () => {} } as React.MouseEvent);
  }, [request, onStartRename]);

  const handleDelete = useCallback(() => {
    onDelete(request.id, { stopPropagation: () => {} } as React.MouseEvent);
  }, [request.id, onDelete]);

  return (
    <RightClickMenu
      items={[
        {
          id: 'rename',
          label: 'Rename',
          icon: <Pencil className="w-4 h-4" />,
          onSelect: handleStartRename,
        },
        {
          id: 'delete',
          label: 'Delete',
          icon: <Trash2 className="w-4 h-4" />,
          destructive: true,
          onSelect: handleDelete,
        },
      ]}
      disabled={renaming}
    >
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        onClick={handleClick}
        className={`flex items-center gap-2 p-2 mb-1 rounded-md cursor-pointer transition-colors group ${
          selected ? "bg-accent text-accent-foreground" : "hover:bg-accent/30"
        } ${isDragging ? "opacity-50" : ""}`}
      >
        <span className={`text-xs font-medium ${getMethodColor(request.method)} w-10 shrink-0`}>
          {request.method}
        </span>
        {renaming ? (
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
          <span className="text-xs font-medium text-foreground flex-1 truncate">
            {truncateName(request.name)}
          </span>
        )}
      </div>
    </RightClickMenu>
  );
}

export default memo(RequestItem);
