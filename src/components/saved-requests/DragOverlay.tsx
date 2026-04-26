import { useDndContext } from "@dnd-kit/core";
import { SavedRequest, HttpMethod } from "../../types";

interface DragOverlayProps {
  requests: SavedRequest[];
  getMethodColor: (method: HttpMethod) => string;
}

export function DragOverlay({ requests, getMethodColor }: DragOverlayProps) {
  const { active } = useDndContext();

  if (!active) return null;

  const activeId = active.id as string;
  const request = requests.find((req) => req.id === activeId);

  if (!request) return null;

  return (
    <div className="pointer-events-none fixed top-0 left-0 z-50 opacity-80">
      <div className="flex items-center gap-2 p-2 mb-1 rounded-md bg-background border border-border shadow-lg">
        <span className={`text-xs font-medium ${getMethodColor(request.method)} w-10 shrink-0`}>
          {request.method}
        </span>
        <span className="text-xs font-medium text-foreground">
          {request.name}
        </span>
      </div>
    </div>
  );
}
