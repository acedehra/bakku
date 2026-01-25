import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { PANEL_WIDTHS_STORAGE_KEY } from "../constants";

interface PanelWidths {
    sidebarWidth: number;
    responseWidth: number;
}

export function usePanelResize() {
    const [widths, setWidths] = useLocalStorage<PanelWidths>(PANEL_WIDTHS_STORAGE_KEY, {
        sidebarWidth: 256,
        responseWidth: 450,
    });

    const handleSidebarResize = useCallback((deltaX: number) => {
        setWidths((prev) => ({
            ...prev,
            sidebarWidth: Math.max(200, Math.min(600, prev.sidebarWidth + deltaX)),
        }));
    }, [setWidths]);

    const handleResponseResize = useCallback((deltaX: number) => {
        setWidths((prev) => ({
            ...prev,
            responseWidth: Math.max(300, Math.min(800, prev.responseWidth - deltaX)),
        }));
    }, [setWidths]);

    return {
        sidebarWidth: widths.sidebarWidth,
        responseWidth: widths.responseWidth,
        handleSidebarResize,
        handleResponseResize,
    };
}
