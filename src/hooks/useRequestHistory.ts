import { useState, useEffect } from "react";
import { RequestHistoryItem } from "../types";
import { HISTORY_STORAGE_KEY, MAX_HISTORY_ITEMS } from "../constants";

export function useRequestHistory() {
    const [history, setHistory] = useState<RequestHistoryItem[]>([]);

    // Load history from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored) as RequestHistoryItem[];
                setHistory(parsed);
            }
        } catch (err) {
            console.error("Failed to load history from localStorage", err);
        }
    }, []);

    // Save history to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
        } catch (err) {
            console.error("Failed to save history to localStorage", err);
        }
    }, [history]);

    const addToHistory = (item: RequestHistoryItem) => {
        setHistory((prev) => {
            const updated = [item, ...prev];
            return updated.slice(0, MAX_HISTORY_ITEMS);
        });
    };

    const clearHistory = () => {
        setHistory([]);
    };

    return {
        history,
        setHistory,
        addToHistory,
        clearHistory,
    };
}
