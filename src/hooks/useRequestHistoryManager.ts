import { useState } from "react";
import { RequestHistoryItem, ResponseData } from "../types";
import { buildUrlWithParams } from "../utils/urlParser";

interface UseRequestHistoryManagerResult {
    selectedHistoryId: string | null;
    handleHistorySelect: (item: RequestHistoryItem) => void;
    clearHistorySelection: () => void;
}

interface UseRequestHistoryManagerProps {
    setMethod: (method: any) => void;
    updateFromHistory: (url: string, params: any) => void;
    setHeaders: (headers: Record<string, string>) => void;
    setBody: (body: string) => void;
    setAuth: (auth: any) => void;
    clearResponse: (response: ResponseData | null) => void;
    clearError: (error: string | null) => void;
}

export function useRequestHistoryManager({
    setMethod,
    updateFromHistory,
    setHeaders,
    setBody,
    setAuth,
    clearResponse,
    clearError,
}: UseRequestHistoryManagerProps): UseRequestHistoryManagerResult {
    const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);

    const handleHistorySelect = (item: RequestHistoryItem): void => {
        setMethod(item.requestData.method);

        // Build full URL with params when loading from history
        const fullUrl = buildUrlWithParams(item.requestData.url, item.requestData.params);

        updateFromHistory(fullUrl, item.requestData.params);

        setHeaders(item.requestData.headers);
        setBody(item.requestData.body);
        setAuth(item.requestData.auth);
        setSelectedHistoryId(item.id);

        if (item.responseData) {
            clearResponse(item.responseData);
        } else {
            clearResponse(null);
        }
        clearError(null);
    };

    const clearHistorySelection = (): void => {
        setSelectedHistoryId(null);
    };

    return {
        selectedHistoryId,
        handleHistorySelect,
        clearHistorySelection,
    };
}
