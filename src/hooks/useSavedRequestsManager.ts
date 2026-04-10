import { useState } from "react";
import { SavedRequest, ResponseData } from "../types";
import { buildUrlWithParams } from "../utils/urlParser";

interface UseSavedRequestsManagerResult {
  selectedSavedRequestId: string | null;
  handleSavedRequestSelect: (request: SavedRequest) => void;
  clearSavedRequestSelection: () => void;
}

interface UseSavedRequestsManagerProps {
  setMethod: (method: any) => void;
  updateFromHistory: (url: string, params: any) => void;
  setHeaders: (headers: Record<string, string>) => void;
  setBody: (body: string) => void;
  setAuth: (auth: any) => void;
  clearResponse: (response: ResponseData | null) => void;
  clearError: (error: string | null) => void;
}

export function useSavedRequestsManager({
  setMethod,
  updateFromHistory,
  setHeaders,
  setBody,
  setAuth,
  clearResponse,
  clearError,
}: UseSavedRequestsManagerProps): UseSavedRequestsManagerResult {
  const [selectedSavedRequestId, setSelectedSavedRequestId] = useState<string | null>(null);

  const handleSavedRequestSelect = (request: SavedRequest): void => {
    setMethod(request.method);

    // Build full URL with params when loading from saved request
    const fullUrl = buildUrlWithParams(request.url, request.params);

    updateFromHistory(fullUrl, request.params);

    setHeaders(request.headers);
    setBody(request.body);
    setAuth(request.auth);
    setSelectedSavedRequestId(request.id);

    clearResponse(request.lastResponse ?? null);
    clearError(null);
  };

  const clearSavedRequestSelection = (): void => {
    setSelectedSavedRequestId(null);
  };

  return {
    selectedSavedRequestId,
    handleSavedRequestSelect,
    clearSavedRequestSelection,
  };
}
