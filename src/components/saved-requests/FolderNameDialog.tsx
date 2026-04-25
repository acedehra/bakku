import { useEffect, useRef } from "react";

interface FolderNameDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (name: string) => void;
  title?: string;
  defaultValue?: string;
}

export function FolderNameDialog({
  open,
  onClose,
  onConfirm,
  title = "Enter folder name",
  defaultValue = "",
}: FolderNameDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [open]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className="w-full max-w-md rounded-lg border border-border bg-background p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-semibold text-foreground">{title}</h2>
        <input
          ref={inputRef}
          type="text"
          defaultValue={defaultValue}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const value = e.currentTarget.value.trim();
              if (value) {
                onConfirm(value);
              }
            } else if (e.key === "Escape") {
              onClose();
            }
          }}
          autoFocus
        />
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              const value = inputRef.current?.value.trim();
              if (value) {
                onConfirm(value);
              }
            }}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
