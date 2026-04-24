import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Clean up after each test
afterEach(() => {
  cleanup();
});

// Mock Tauri APIs that are not available in test environment
vi.mock("@tauri-apps/plugin-http", () => ({
  fetch: vi.fn(),
}));

vi.mock("@tauri-apps/api", () => ({
  invoke: vi.fn(),
}));

// Mock performance.now() for consistent timing tests
vi.stubGlobal("performance", {
  ...global.performance,
  now: vi.fn(() => 0),
});

// Mock btoa for Basic Auth encoding tests
vi.stubGlobal("btoa", (str: string) => {
  return Buffer.from(str).toString("base64");
});
