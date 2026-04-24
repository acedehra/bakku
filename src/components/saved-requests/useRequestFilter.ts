import { useMemo } from "react";
import { SavedRequest, RequestFolder } from "../../types";

export interface FilteredData {
  folders: RequestFolder[];
  requests: SavedRequest[];
}

export function useRequestFilter(
  savedRequests: SavedRequest[],
  folders: RequestFolder[],
  searchQuery: string
): FilteredData {
  return useMemo(() => {
    if (!searchQuery.trim()) {
      return { folders, requests: savedRequests };
    }

    const query = searchQuery.toLowerCase();
    const filteredRequests = savedRequests.filter(
      (req) =>
        req.name.toLowerCase().includes(query) ||
        req.url.toLowerCase().includes(query) ||
        req.method.toLowerCase().includes(query)
    );

    const folderIdsWithMatches = new Set(
      filteredRequests
        .map((req) => req.folderId)
        .filter(Boolean) as string[]
    );
    const filteredFolders = folders.filter(
      (folder) =>
        folder.name.toLowerCase().includes(query) ||
        folderIdsWithMatches.has(folder.id)
    );

    return { folders: filteredFolders, requests: filteredRequests };
  }, [savedRequests, folders, searchQuery]);
}
