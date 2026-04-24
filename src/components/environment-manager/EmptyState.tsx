import { memo } from "react";
import { Settings } from "lucide-react";

function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
      <div className="bg-accent/20 p-4 rounded-full mb-4">
        <Settings size={40} className="opacity-20" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-2">No Environment Selected</h3>
      <p className="max-w-xs">Create or select an environment from the sidebar to manage its variables.</p>
    </div>
  );
}

export default memo(EmptyState);
