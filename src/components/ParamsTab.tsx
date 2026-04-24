import { KVEntry, Environment } from "../types";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VariableInput } from "./VariableInput";

interface ParamsTabProps {
  paramEntries: KVEntry[];
  onParamEntriesChange: (entries: KVEntry[]) => void;
  activeEnv: Environment | null;
}

export function ParamsTab({
  paramEntries,
  onParamEntriesChange,
  activeEnv,
}: ParamsTabProps) {
  const updateParam = (id: string, updates: Partial<KVEntry>) => {
    onParamEntriesChange(
      paramEntries.map((entry) => (entry.id === id ? { ...entry, ...updates } : entry))
    );
  };

  const addParam = () => {
    onParamEntriesChange([
      ...paramEntries,
      { id: crypto.randomUUID(), key: "", value: "", enabled: true },
    ]);
  };

  const deleteParam = (id: string) => {
    onParamEntriesChange(paramEntries.filter((entry) => entry.id !== id));
  };

  return (
    <div className="space-y-2">
      {paramEntries.map((entry) => (
        <div
          key={entry.id}
          className="flex gap-2 items-center group p-1.5 rounded-md hover:bg-accent/30 focus-within:bg-accent/40 transition-colors"
        >
          <input
            type="checkbox"
            checked={entry.enabled}
            onChange={(e) => updateParam(entry.id, { enabled: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <VariableInput
            placeholder="Key"
            value={entry.key}
            environment={activeEnv}
            onChange={(val) => updateParam(entry.id, { key: val })}
            className="flex-1"
          />
          <VariableInput
            placeholder="Value"
            value={entry.value}
            environment={activeEnv}
            onChange={(val) => updateParam(entry.id, { value: val })}
            className="flex-1"
          />
          <Button
            onClick={() => deleteParam(entry.id)}
            variant="outline"
            size="icon"
            aria-label="Delete param"
            title="Delete param"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      ))}
      <button
        onClick={addParam}
        className="px-4 py-2 text-sm font-medium rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        + Add Param
      </button>
    </div>
  );
}
