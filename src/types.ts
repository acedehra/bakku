export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD";

export type AuthType = "None" | "Basic" | "Bearer" | "Custom";

export interface AuthConfig {
  type: AuthType;
  username?: string;
  password?: string;
  token?: string;
  headerName?: string;
  headerValue?: string;
}

export interface KVEntry {
  id: string;         // stable key for React lists; uuid-ish
  key: string;
  value: string;
  enabled: boolean;
}

export interface RequestData {
  method: HttpMethod;
  url: string;                  // source of truth for query string
  headers: KVEntry[];                // ordered, may repeat keys
  body: string;
  auth: AuthConfig;
}

export interface ResponseData {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  timing: number; // milliseconds
  size: number; // bytes
}

export interface EnvironmentVariable {
  key: string;
  value: string;
  enabled: boolean;
}

export interface Environment {
  id: string;
  name: string;
  variables: EnvironmentVariable[];
}

export interface RequestHistoryItem {
  id: string;
  method: HttpMethod;
  url: string;
  timestamp: number;
  status: number | null;
  statusText: string | null;
  requestData: RequestData;
  responseData: ResponseData | null;
  folder?: string;
}

export interface SavedRequest {
  id: string;
  name: string;
  method: HttpMethod;
  url: string;
  headers: KVEntry[];
  body: string;
  auth: AuthConfig;
  folderId: string | null;
  createdAt: number;
  updatedAt: number;
  /** Last successful HTTP response when this saved request was sent (from SQLite). */
  lastResponse?: ResponseData | null;
}

export interface RequestFolder {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
}
