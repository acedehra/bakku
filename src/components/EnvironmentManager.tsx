import { X, Settings } from "lucide-react";
import { Environment } from "../types";
import { useEnvironmentManager } from "./environment-manager/useEnvironmentManager";
import EnvironmentList from "./environment-manager/EnvironmentList";
import VariableEditor from "./environment-manager/VariableEditor";
import EmptyState from "./environment-manager/EmptyState";

interface EnvironmentManagerProps {
  environments: Environment[];
  onAdd: (name: string) => Environment;
  onUpdate: (env: Environment) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export function EnvironmentManager({
  environments,
  onAdd,
  onUpdate,
  onDelete,
  onClose,
}: EnvironmentManagerProps) {
  const {
    state,
    setSelectedEnvId,
    setIsAddingEnv,
    setNewEnvName,
    handleAddEnv,
    handleAddVariable,
    updateVariable,
    deleteVariable,
  } = useEnvironmentManager(environments);

  const activeEnv = environments.find((e) => e.id === state.selectedEnvId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-background border border-border rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-4 border-b border-border flex justify-between items-center bg-accent/5">
          <div className="flex items-center gap-2">
            <Settings className="text-primary" size={20} />
            <h2 className="text-lg font-bold">Manage Environments</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-accent rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <EnvironmentList
            environments={environments}
            selectedEnvId={state.selectedEnvId}
            isAddingEnv={state.isAddingEnv}
            newEnvName={state.newEnvName}
            onSelectedEnvChange={setSelectedEnvId}
            onDelete={onDelete}
            onToggleAddingEnv={setIsAddingEnv}
            onNewEnvNameChange={setNewEnvName}
            onAddEnv={() => handleAddEnv(onAdd)}
          />

          <div className="flex-1 flex flex-col bg-background">
            {activeEnv ? (
              <VariableEditor
                activeEnv={activeEnv}
                onAddVariable={() => handleAddVariable(activeEnv, onUpdate)}
                onUpdateVariable={(index, updates) => updateVariable(activeEnv, index, updates, onUpdate)}
                onDeleteVariable={(index) => deleteVariable(activeEnv, index, onUpdate)}
              />
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
