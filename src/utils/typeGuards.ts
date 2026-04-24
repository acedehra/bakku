import { SavedRequest, RequestFolder, KVEntry } from "../types";

/**
 * Type guard to check if data is a SavedRequest
 */
export function isSavedRequest(data: unknown): data is SavedRequest {
  return (
    typeof data === "object" &&
    data !== null &&
    "id" in data &&
    "name" in data &&
    "method" in data &&
    "url" in data &&
    "headers" in data &&
    "body" in data &&
    "auth" in data &&
    "folderId" in data &&
    "createdAt" in data &&
    "updatedAt" in data
  );
}

/**
 * Type guard to check if data is a RequestFolder
 */
export function isRequestFolder(data: unknown): data is RequestFolder {
  return (
    typeof data === "object" &&
    data !== null &&
    "id" in data &&
    "name" in data &&
    "createdAt" in data &&
    "updatedAt" in data
  );
}

/**
 * Type guard to check if data is a KVEntry
 */
export function isKVEntry(data: unknown): data is KVEntry {
  return (
    typeof data === "object" &&
    data !== null &&
    "id" in data &&
    "key" in data &&
    "value" in data &&
    "enabled" in data
  );
}

/**
 * Assert that data is a SavedRequest, throws if not
 */
export function assertSavedRequest(data: unknown): SavedRequest {
  if (!isSavedRequest(data)) {
    throw new Error("Data is not a valid SavedRequest");
  }
  return data;
}

/**
 * Assert that data is a RequestFolder, throws if not
 */
export function assertRequestFolder(data: unknown): RequestFolder {
  if (!isRequestFolder(data)) {
    throw new Error("Data is not a valid RequestFolder");
  }
  return data;
}

/**
 * Assert that data is a KVEntry, throws if not
 */
export function assertKVEntry(data: unknown): KVEntry {
  if (!isKVEntry(data)) {
    throw new Error("Data is not a valid KVEntry");
  }
  return data;
}
