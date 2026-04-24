import { memo } from "react";
import { ChevronDown, Settings } from "lucide-react";
import { Environment } from "../../types";
import { Button } from "../ui/button";

interface EnvironmentSelectorProps {
  environments: Environment[];
  activeEnvId: string | null;
  onActiveEnvChange: (id: string | null) => void;
  onOpenEnvManager: () => void;
}

function EnvironmentSelector({
  environments,
  activeEnvId,
  onActiveEnvChange,
  onOpenEnvManager,
}: EnvironmentSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 border border-border/50 hover:bg-accent/30 transition-colors group">
        <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-70 group-hover:text-primary transition-colors">
          Environment
        </span>
        <div className="relative flex items-center h-6 min-w-[140px]">
          <select
            value={activeEnvId || ""}
            onChange={(e) => onActiveEnvChange(e.target.value || null)}
            className="w-full appearance-none bg-transparent pr-5 text-xs font-bold focus:outline-none cursor-pointer text-primary"
          >
            <option value="">No Environment</option>
            {environments.map((env) => (
              <option key={env.id} value={env.id}>
                {env.name}
              </option>
            ))}
          </select>
          <ChevronDown
            size={10}
            className="absolute right-0 pointer-events-none opacity-50 text-primary"
          />
        </div>
      </div>
      <Button
        variant="outline"
        size="icon"
        onClick={onOpenEnvManager}
        className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/5 border-border/50 transition-all rounded-full"
        title="Manage Environments"
      >
        <Settings size={14} />
      </Button>
    </div>
  );
}

export default memo(EnvironmentSelector);
