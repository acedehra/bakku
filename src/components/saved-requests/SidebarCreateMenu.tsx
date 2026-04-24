import React, { useEffect } from "react";
import { Plus } from "lucide-react";

interface SidebarCreateMenuProps {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  onCreateRequest: () => void;
  onCreateFolder: () => void;
}

export function SidebarCreateMenu({
  open,
  onToggle,
  onClose,
  onCreateRequest,
  onCreateFolder,
}: SidebarCreateMenuProps) {
  const menuRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (menuRef.current?.contains(e.target as Node)) return;
      onClose();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  return (
    <div ref={menuRef} className="relative border-b border-border p-2">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Create new"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border/50 bg-background text-foreground transition-colors hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Plus className="size-4 shrink-0 text-foreground" strokeWidth={2} aria-hidden />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute left-2 top-full z-50 mt-1 min-w-[11rem] overflow-hidden rounded-md border border-border bg-popover py-1 text-sm text-popover-foreground shadow-md"
        >
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-accent hover:text-accent-foreground"
            onClick={() => {
              onClose();
              onCreateRequest();
            }}
          >
            <span className="flex w-4 shrink-0 justify-center font-light text-muted-foreground" aria-hidden>
              +
            </span>
            Request
          </button>
          <div className="my-1 h-px bg-border" role="separator" />
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-accent hover:text-accent-foreground"
            onClick={() => {
              onClose();
              onCreateFolder();
            }}
          >
            <span className="flex w-4 shrink-0 justify-center font-light text-muted-foreground" aria-hidden>
              +
            </span>
            Folder
          </button>
        </div>
      )}
    </div>
  );
}
