import { useEffect, useRef, useCallback } from "react";

interface ResizeHandleProps {
  onResize: (deltaX: number) => void;
  orientation?: "vertical" | "horizontal";
}

export function ResizeHandle({ onResize, orientation = "vertical" }: ResizeHandleProps) {
  const isResizing = useRef(false);
  const startX = useRef(0);
  const onResizeRef = useRef(onResize);

  // Keep the callback ref up to date
  useEffect(() => {
    onResizeRef.current = onResize;
  }, [onResize]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const deltaX = e.clientX - startX.current;
      onResizeRef.current(deltaX);
      startX.current = e.clientX;
    };

    const handleMouseUp = () => {
      if (!isResizing.current) return;
      isResizing.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    // Always attach listeners, they check the ref internally
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isResizing.current = true;
    startX.current = e.clientX;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    e.preventDefault();
    e.stopPropagation();
  }, []);

  return (
    <div
      onMouseDown={handleMouseDown}
      className={`${
        orientation === "vertical"
          ? "w-1 cursor-col-resize hover:bg-primary/50"
          : "h-1 cursor-row-resize hover:bg-primary/50"
      } bg-border transition-colors`}
      role="separator"
      aria-orientation={orientation}
    />
  );
}
