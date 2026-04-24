import { memo } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Environment } from "../../types";
import { Button } from "../ui/button";

interface EnvironmentListProps {
  environments: Environment[];
  selectedEnvId: string | null;
  isAddingEnv: boolean;
  newEnvName: string;
  onSelectedEnvChange: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleAddingEnv: (isAdding: boolean) => void;
  onNewEnvNameChange: (name: string) => void;
  onAddEnv: () => void;
}

function EnvironmentList({
  environments,
  selectedEnvId,
  isAddingEnv,
  newEnvName,
  onSelectedEnvChange,
  onDelete,
  onToggleAddingEnv,
  onNewEnvNameChange,
  onAddEnv,
}: EnvironmentListProps) {
  const handleDeleteEnv = (e: React.MouseEvent, envId: string) => {
    e.stopPropagation();
    onDelete(envId);
    if (selectedEnvId === envId) {
      const nextEnv = environments.find((item) => item.id !== envId);
      onSelectedEnvChange(nextEnv?.id || "");
    }
  };

  return (
    <div className="w-64 border-r border-border bg-accent/5 flex flex-col">
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {environments.map((env) => (
          <button
            key={env.id}
            onClick={() => onSelectedEnvChange(env.id)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-all ${
              selectedEnvId === env.id
                ? "bg-primary text-primary-foreground shadow-sm scale-[1.02]"
                : "hover:bg-accent/50 text-muted-foreground"
            }`}
          >
            <span className="truncate">{env.name}</span>
            {selectedEnvId === env.id && (
              <Trash2
                size={14}
                className="opacity-70 hover:opacity-100 transition-opacity"
                onClick={(e) => handleDeleteEnv(e, env.id)}
              />
            )}
          </button>
        ))}
        {isAddingEnv ? (
          <div className="p-2 space-y-2">
            <input
              autoFocus
              type="text"
              value={newEnvName}
              onChange={(e) => onNewEnvNameChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onAddEnv()}
              placeholder="Env name..."
              className="w-full h-8 px-2 text-xs rounded border border-input bg-background focus:ring-1 focus:ring-primary"
            />
            <div className="flex gap-1">
              <Button
                size="sm"
                className="h-7 text-[10px] flex-1"
                onClick={onAddEnv}
              >
                Add
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-[10px] flex-1"
                onClick={() => onToggleAddingEnv(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => onToggleAddingEnv(true)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
          >
            <Plus size={14} />
            <span>New Environment</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default memo(EnvironmentList);
