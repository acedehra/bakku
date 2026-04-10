import { invoke } from "@tauri-apps/api/core";
import type { RequestFolder, SavedRequest } from "../types";

export interface LibrarySnapshot {
  folders: RequestFolder[];
  requests: SavedRequest[];
}

export async function getLibrary(): Promise<LibrarySnapshot> {
  return invoke<LibrarySnapshot>("get_library");
}

export async function createFolder(folder: RequestFolder): Promise<RequestFolder> {
  return invoke<RequestFolder>("create_folder", { folder });
}

export async function updateFolder(folder: RequestFolder): Promise<RequestFolder> {
  return invoke<RequestFolder>("update_folder", { folder });
}

export async function deleteFolder(id: string): Promise<void> {
  return invoke("delete_folder", { id });
}

export async function createRequest(request: SavedRequest): Promise<SavedRequest> {
  return invoke<SavedRequest>("create_request", { request });
}

export async function updateRequest(request: SavedRequest): Promise<SavedRequest> {
  return invoke<SavedRequest>("update_request", { request });
}

export async function deleteRequest(id: string): Promise<void> {
  return invoke("delete_request", { id });
}

export async function importLibrary(
  folders: RequestFolder[],
  requests: SavedRequest[]
): Promise<LibrarySnapshot> {
  return invoke<LibrarySnapshot>("import_library", { folders, requests });
}
