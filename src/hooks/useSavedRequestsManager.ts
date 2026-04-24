import { useState } from "react";
import { SavedRequest, ResponseData, KVEntry, HttpMethod, AuthConfig } from "../types";

interface UseSavedRequestsManagerResult {
  selectedSavedRequestId: string | null;
  handleSavedRequestSelect: (request: SavedRequest) => void;
  clearSavedRequestSelection: () => void;
}

interface UseSavedRequestsManagerProps {
  setMethod: (method: HttpMethod) => void;
  setUrl: (url: string) => void;
  setHeaders: (headers: KVEntry[]) => void;
  setBody: (body: string) => void;
  setAuth: (auth: AuthConfig) => void;
  clearResponse: (response: ResponseData | null) => void;
  clearError: (error: string | null) => void;
}

export function useSavedRequestsManager({
  setMethod,
  setUrl,
  setHeaders,
  setBody,
  setAuth,
  clearResponse,
  clearError,
}: UseSavedRequestsManagerProps): UseSavedRequestsManagerResult {
  const [selectedSavedRequestId, setSelectedSavedRequestId] = useState<string | null>(null);

  const handleSavedRequestSelect = (request: SavedRequest): void => {
    setMethod(request.method);
    setUrl(request.url);
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
