import { memo } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Environment, EnvironmentVariable } from "../../types";

interface VariableEditorProps {
  activeEnv: Environment;
  onAddVariable: () => void;
  onUpdateVariable: (index: number, updates: Partial<EnvironmentVariable>) => void;
  onDeleteVariable: (index: number) => void;
}

function VariableEditor({
  activeEnv,
  onAddVariable,
  onUpdateVariable,
  onDeleteVariable,
}: VariableEditorProps) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-4 border-b border-border bg-accent/5">
        <div className="flex items-center gap-4">
          <h3 className="text-sm font-bold opacity-60 uppercase tracking-wider">
            Variables for {activeEnv.name}
          </h3>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <th className="pb-3 pl-2 w-8"></th>
              <th className="pb-3 px-2">Key</th>
              <th className="pb-3 px-2">Value</th>
              <th className="pb-3 pr-2 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {activeEnv.variables.map((v, i) => (
              <tr key={i} className="group hover:bg-accent/20 transition-colors">
                <td className="py-2 pl-2">
                  <input
                    type="checkbox"
                    checked={v.enabled}
                    onChange={(e) => onUpdateVariable(i, { enabled: e.target.checked })}
                    className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                  />
                </td>
                <td className="py-2 px-2">
                  <input
                    type="text"
                    value={v.key}
                    onChange={(e) => onUpdateVariable(i, { key: e.target.value })}
                    placeholder="VARIABLE_NAME"
                    className="w-full h-8 px-2 text-sm rounded border border-transparent bg-transparent hover:border-input focus:border-primary focus:bg-background transition-all outline-none"
                  />
                </td>
                <td className="py-2 px-2">
                  <input
                    type="text"
                    value={v.value}
                    onChange={(e) => onUpdateVariable(i, { value: e.target.value })}
                    placeholder="Value"
                    className="w-full h-8 px-2 text-sm rounded border border-transparent bg-transparent hover:border-input focus:border-primary focus:bg-background transition-all outline-none"
                  />
                </td>
                <td className="py-2 pr-2 text-right">
                  <button
                    onClick={() => onDeleteVariable(i)}
                    className="p-1 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          onClick={onAddVariable}
          className="mt-4 flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <Plus size={14} />
          <span>Add variable</span>
        </button>
      </div>
    </div>
  );
}

export default memo(VariableEditor);
