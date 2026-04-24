import { memo } from "react";
import { KVEntry, Environment } from "../types";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VariableInput } from "./VariableInput";

export interface GenericKVTabConfig {
  keyPlaceholder: string;
  valuePlaceholder: string;
  deleteAriaLabel: string;
  deleteTitle: string;
  addButtonText: string;
}

interface GenericKVTabProps {
  entries: KVEntry[];
  onChange: (entries: KVEntry[]) => void;
  activeEnv: Environment | null;
  config: GenericKVTabConfig;
}

function GenericKVTab({
  entries,
  onChange,
  activeEnv,
  config,
}: GenericKVTabProps) {
  const updateEntry = (id: string, updates: Partial<KVEntry>) => {
    onChange(
      entries.map((entry) => (entry.id === id ? { ...entry, ...updates } : entry))
    );
  };

  const addEntry = () => {
    onChange([
      ...entries,
      { id: crypto.randomUUID(), key: "", value: "", enabled: true },
    ]);
  };

  const deleteEntry = (id: string) => {
    onChange(entries.filter((entry) => entry.id !== id));
  };

  return (
    <div className="space-y-2">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="flex gap-2 items-center group p-1.5 rounded-md hover:bg-accent/30 focus-within:bg-accent/40 transition-colors"
        >
          <input
            type="checkbox"
            checked={entry.enabled}
            onChange={(e) => updateEntry(entry.id, { enabled: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <VariableInput
            placeholder={config.keyPlaceholder}
            value={entry.key}
            environment={activeEnv}
            onChange={(val) => updateEntry(entry.id, { key: val })}
            className="flex-1"
          />
          <VariableInput
            placeholder={config.valuePlaceholder}
            value={entry.value}
            environment={activeEnv}
            onChange={(val) => updateEntry(entry.id, { value: val })}
            className="flex-1"
          />
          <Button
            onClick={() => deleteEntry(entry.id)}
            variant="outline"
            size="icon"
            aria-label={config.deleteAriaLabel}
            title={config.deleteTitle}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      ))}
      <button
        onClick={addEntry}
        className="px-4 py-2 text-sm font-medium rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        {config.addButtonText}
      </button>
    </div>
  );
}

export default memo(GenericKVTab);
