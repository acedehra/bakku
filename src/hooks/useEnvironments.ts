import { useState, useEffect } from "react";
import { Environment } from "../types";
import { ENVIRONMENTS_STORAGE_KEY, ACTIVE_ENV_ID_STORAGE_KEY } from "../constants";

export function useEnvironments() {
    const [environments, setEnvironments] = useState<Environment[]>([]);
    const [activeEnvId, setActiveEnvId] = useState<string | null>(null);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const storedEnvs = localStorage.getItem(ENVIRONMENTS_STORAGE_KEY);
            if (storedEnvs) {
                setEnvironments(JSON.parse(storedEnvs));
            }

            const storedActiveId = localStorage.getItem(ACTIVE_ENV_ID_STORAGE_KEY);
            if (storedActiveId) {
                setActiveEnvId(storedActiveId);
            }
        } catch (err) {
            console.error("Failed to load environments from localStorage", err);
        }
    }, []);

    // Save to localStorage whenever environments change
    useEffect(() => {
        try {
            localStorage.setItem(ENVIRONMENTS_STORAGE_KEY, JSON.stringify(environments));
        } catch (err) {
            console.error("Failed to save environments to localStorage", err);
        }
    }, [environments]);

    // Save activeEnvId to localStorage
    useEffect(() => {
        try {
            if (activeEnvId) {
                localStorage.setItem(ACTIVE_ENV_ID_STORAGE_KEY, activeEnvId);
            } else {
                localStorage.removeItem(ACTIVE_ENV_ID_STORAGE_KEY);
            }
        } catch (err) {
            console.error("Failed to save active environment ID to localStorage", err);
        }
    }, [activeEnvId]);

    const addEnvironment = (name: string): Environment => {
        const newEnv: Environment = {
            id: `env-${Date.now()}`,
            name,
            variables: [],
        };
        setEnvironments((prev) => [...prev, newEnv]);
        return newEnv;
    };

    const updateEnvironment = (updatedEnv: Environment) => {
        setEnvironments((prev) =>
            prev.map((env) => (env.id === updatedEnv.id ? updatedEnv : env))
        );
    };

    const deleteEnvironment = (id: string) => {
        setEnvironments((prev) => prev.filter((env) => env.id !== id));
        if (activeEnvId === id) {
            setActiveEnvId(null);
        }
    };

    const activeEnv = environments.find((env) => env.id === activeEnvId) || null;

    return {
        environments,
        activeEnvId,
        activeEnv,
        setActiveEnvId,
        addEnvironment,
        updateEnvironment,
        deleteEnvironment,
    };
}
