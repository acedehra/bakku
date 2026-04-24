import React, { useCallback, memo } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { SavedRequest, HttpMethod } from "../../types";

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
  const handleClick = useCallback(() => {
    onSelect(request);
  }, [request, onSelect]);

  const handleStartRename = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onStartRename(request, e);
  }, [request, onStartRename]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    onDelete(request.id, e);
  }, [request.id, onDelete]);

  return (
    <div
      onClick={handleClick}
      className={`flex items-center gap-2 p-2 mb-1 rounded-md cursor-pointer transition-colors group ${
        selected ? "bg-accent text-accent-foreground" : "hover:bg-accent/30"
      }`}
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
        <>
          <span className="text-xs font-medium text-foreground flex-1 truncate">
            {truncateName(request.name)}
          </span>
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={handleStartRename}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              title="Rename"
            >
              <Pencil className="size-4 shrink-0" strokeWidth={2} aria-hidden />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              title="Delete"
            >
              <Trash2 className="size-4 shrink-0" strokeWidth={2} aria-hidden />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default memo(RequestItem);
