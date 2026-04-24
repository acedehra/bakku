import { KVEntry, Environment } from "../types";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VariableInput } from "./VariableInput";

interface HeadersTabProps {
  headers: KVEntry[];
  onHeadersChange: (headers: KVEntry[]) => void;
  activeEnv: Environment | null;
}

export function HeadersTab({
  headers,
  onHeadersChange,
  activeEnv,
}: HeadersTabProps) {
  const updateHeader = (id: string, updates: Partial<KVEntry>) => {
    onHeadersChange(
      headers.map((h) => (h.id === id ? { ...h, ...updates } : h))
    );
  };

  const addHeader = () => {
    onHeadersChange([
      ...headers,
      { id: crypto.randomUUID(), key: "", value: "", enabled: true },
    ]);
  };

  const deleteHeader = (id: string) => {
    onHeadersChange(headers.filter((h) => h.id !== id));
  };

  return (
    <div className="space-y-2">
      {headers.map((header) => (
        <div
          key={header.id}
          className="flex gap-2 items-center group p-1.5 rounded-md hover:bg-accent/30 focus-within:bg-accent/40 transition-colors"
        >
          <input
            type="checkbox"
            checked={header.enabled}
            onChange={(e) => updateHeader(header.id, { enabled: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <VariableInput
            placeholder="Header name"
            value={header.key}
            environment={activeEnv}
            onChange={(val) => updateHeader(header.id, { key: val })}
            className="flex-1"
          />
          <VariableInput
            placeholder="Header value"
            value={header.value}
            environment={activeEnv}
            onChange={(val) => updateHeader(header.id, { value: val })}
            className="flex-1"
          />
          <Button
            onClick={() => deleteHeader(header.id)}
            variant="outline"
            size="icon"
            aria-label="Delete header"
            title="Delete header"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      ))}
      <button
        onClick={addHeader}
        className="px-4 py-2 text-sm font-medium rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        + Add Header
      </button>
    </div>
  );
}
