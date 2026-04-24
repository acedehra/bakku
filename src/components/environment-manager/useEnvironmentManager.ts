import { useState, useCallback } from "react";
import { Environment, EnvironmentVariable } from "../../types";

interface EnvironmentManagerState {
  selectedEnvId: string | null;
  isAddingEnv: boolean;
  newEnvName: string;
}

export function useEnvironmentManager(initialEnvironments: Environment[]) {
  const [state, setState] = useState<EnvironmentManagerState>({
    selectedEnvId: initialEnvironments.length > 0 ? initialEnvironments[0].id : null,
    isAddingEnv: false,
    newEnvName: "",
  });

  const setSelectedEnvId = useCallback((id: string | null) => {
    setState((prev) => ({ ...prev, selectedEnvId: id }));
  }, []);

  const setIsAddingEnv = useCallback((isAdding: boolean) => {
    setState((prev) => ({ ...prev, isAddingEnv: isAdding }));
  }, []);

  const setNewEnvName = useCallback((name: string) => {
    setState((prev) => ({ ...prev, newEnvName: name }));
  }, []);

  const handleAddEnv = useCallback(
    (onAdd: (name: string) => Environment) => {
      if (state.newEnvName.trim()) {
        const newEnv = onAdd(state.newEnvName);
        setSelectedEnvId(newEnv.id);
        setNewEnvName("");
        setIsAddingEnv(false);
      }
    },
    [state.newEnvName, setSelectedEnvId, setNewEnvName, setIsAddingEnv]
  );

  const handleAddVariable = useCallback(
    (activeEnv: Environment | undefined, onUpdate: (env: Environment) => void) => {
      if (activeEnv) {
        const newVar: EnvironmentVariable = {
          key: "",
          value: "",
          enabled: true,
        };
        onUpdate({
          ...activeEnv,
          variables: [...activeEnv.variables, newVar],
        });
      }
    },
    []
  );

  const updateVariable = useCallback(
    (
      activeEnv: Environment | undefined,
      index: number,
      updates: Partial<EnvironmentVariable>,
      onUpdate: (env: Environment) => void
    ) => {
      if (activeEnv) {
        const newVariables = [...activeEnv.variables];
        newVariables[index] = { ...newVariables[index], ...updates };
        onUpdate({ ...activeEnv, variables: newVariables });
      }
    },
    []
  );

  const deleteVariable = useCallback(
    (
      activeEnv: Environment | undefined,
      index: number,
      onUpdate: (env: Environment) => void
    ) => {
      if (activeEnv) {
        const newVariables = activeEnv.variables.filter((_, i) => i !== index);
        onUpdate({ ...activeEnv, variables: newVariables });
      }
    },
    []
  );

  return {
    state,
    setSelectedEnvId,
    setIsAddingEnv,
    setNewEnvName,
    handleAddEnv,
    handleAddVariable,
    updateVariable,
    deleteVariable,
  };
}
