import { describe, it, expect } from "vitest";
import {
  hasProtocol,
  getBaseUrl,
  parseUrlParams,
  buildUrlWithParams,
  parseUrlParamsOrdered,
  buildUrlWithOrderedParams,
} from "../urlParser";

describe("urlParser", () => {
  describe("hasProtocol", () => {
    it("should return true for URLs with http protocol", () => {
      expect(hasProtocol("http://example.com")).toBe(true);
    });

    it("should return true for URLs with https protocol", () => {
      expect(hasProtocol("https://example.com")).toBe(true);
    });

    it("should return true for URLs with other protocols", () => {
      expect(hasProtocol("ftp://example.com")).toBe(true);
      expect(hasProtocol("ws://example.com")).toBe(true);
    });

    it("should return false for URLs without protocol", () => {
      expect(hasProtocol("example.com")).toBe(false);
      expect(hasProtocol("/api/users")).toBe(false);
    });

    it("should return true for URLs with protocol that starts with letter", () => {
      expect(hasProtocol("HTTP://example.com")).toBe(true);
    });
  });

  describe("getBaseUrl", () => {
    it("should return empty string for empty input", () => {
      expect(getBaseUrl("")).toBe("");
    });

    it("should return input for URL without query params and no protocol", () => {
      expect(getBaseUrl("https://api.example.com/users")).toBe(
        "https://api.example.com/users"
      );
    });

    it("should strip query params from URL with protocol", () => {
      expect(getBaseUrl("https://api.example.com/users?page=1&limit=10")).toBe(
        "https://api.example.com/users"
      );
    });

    it("should strip query params from URL without protocol", () => {
      expect(getBaseUrl("api.example.com/users?page=1")).toBe(
        "api.example.com/users"
      );
    });

    it("should handle URL with only protocol and host", () => {
      expect(getBaseUrl("https://example.com")).toBe("https://example.com");
    });

    it("should handle URL with path but no query params", () => {
      expect(getBaseUrl("https://example.com/api/v1/users")).toBe(
        "https://example.com/api/v1/users"
      );
    });

    it("should handle URL with fragment", () => {
      expect(getBaseUrl("https://example.com/users#section")).toBe(
        "https://example.com/users#section"
      );
    });

    it("should handle malformed URLs gracefully", () => {
      const malformed = "not-a-valid-url://??";
      expect(getBaseUrl(malformed)).toBe(malformed);
    });
  });

  describe("parseUrlParams", () => {
    it("should return empty object for empty string", () => {
      expect(parseUrlParams("")).toEqual({});
    });

    it("should return empty object for URL without query params", () => {
      expect(parseUrlParams("https://example.com")).toEqual({});
    });

    it("should parse single query param", () => {
      const result = parseUrlParams("https://example.com?key=value");
      expect(result).toEqual({ key: "value" });
    });

    it("should parse multiple query params", () => {
      const result = parseUrlParams(
        "https://example.com?key1=value1&key2=value2"
      );
      expect(result).toEqual({ key1: "value1", key2: "value2" });
    });

    it("should handle URL without protocol", () => {
      const result = parseUrlParams("example.com?key=value");
      expect(result).toEqual({ key: "value" });
    });

    it("should decode URL-encoded values", () => {
      const result = parseUrlParams(
        "https://example.com?name=John%20Doe&email=test%40example.com"
      );
      expect(result).toEqual({
        name: "John Doe",
        email: "test@example.com",
      });
    });

    it("should handle params with empty values", () => {
      const result = parseUrlParams("https://example.com?key=&name=test");
      expect(result).toEqual({ key: "", name: "test" });
    });

    it("should handle params without values", () => {
      const result = parseUrlParams("https://example.com?flag&name=test");
      expect(result).toEqual({ flag: "", name: "test" });
    });

    it("should handle special characters in keys", () => {
      const result = parseUrlParams(
        "https://example.com?user%5Bname%5D=John&user%5Bage%5D=30"
      );
      expect(result).toEqual({
        "user[name]": "John",
        "user[age]": "30",
      });
    });

    it("should handle malformed URL-encoded strings", () => {
      const result = parseUrlParams("https://example.com?key=%invalid%");
      expect(result).toHaveProperty("key");
    });
  });

  describe("buildUrlWithParams", () => {
    it("should return original URL when no params provided", () => {
      const result = buildUrlWithParams("https://example.com", {});
      expect(result).toBe("https://example.com");
    });

    it("should return empty string for empty baseUrl", () => {
      const result = buildUrlWithParams("", { key: "value" });
      expect(result).toBe("");
    });

    it("should add query params to URL with protocol", () => {
      const result = buildUrlWithParams("https://example.com", {
        key: "value",
      });
      expect(result).toBe("https://example.com?key=value");
    });

    it("should add multiple query params", () => {
      const result = buildUrlWithParams("https://example.com", {
        key1: "value1",
        key2: "value2",
      });
      expect(result).toBe("https://example.com?key1=value1&key2=value2");
    });

    it("should handle URL without protocol", () => {
      const result = buildUrlWithParams("example.com", { key: "value" });
      expect(result).toBe("example.com?key=value");
    });

    it("should encode keys and values", () => {
      const result = buildUrlWithParams("https://example.com", {
        name: "John Doe",
        email: "test@example.com",
      });
      expect(result).toBe(
        "https://example.com?name=John%20Doe&email=test%40example.com"
      );
    });

    it("should replace existing query params", () => {
      const result = buildUrlWithParams("https://example.com?old=param", {
        new: "value",
      });
      expect(result).toBe("https://example.com?new=value");
    });

    it("should handle empty values in params", () => {
      const result = buildUrlWithParams("https://example.com", {
        key: "",
        name: "test",
      });
      expect(result).toBe("https://example.com?key=&name=test");
    });

    it("should handle URL that already has query params", () => {
      const result = buildUrlWithParams(
        "https://example.com?existing=value",
        { new: "param" }
      );
      expect(result).toBe("https://example.com?new=param");
    });

    it("should handle special characters in keys", () => {
      const result = buildUrlWithParams("https://example.com", {
        "user[name]": "John",
        "user[age]": "30",
      });
      expect(result).toBe(
        "https://example.com?user%5Bname%5D=John&user%5Bage%5D=30"
      );
    });
  });

  describe("parseUrlParamsOrdered", () => {
    it("should return empty array for empty string", () => {
      expect(parseUrlParamsOrdered("")).toEqual([]);
    });

    it("should parse multiple query params and preserve order", () => {
      const result = parseUrlParamsOrdered("https://example.com?z=3&a=1&m=2");
      expect(result.map(e => ({ key: e.key, value: e.value }))).toEqual([
        { key: "z", value: "3" },
        { key: "a", value: "1" },
        { key: "m", value: "2" },
      ]);
    });

    it("should handle duplicate keys", () => {
      const result = parseUrlParamsOrdered("https://example.com?id=1&id=2");
      expect(result.map(e => ({ key: e.key, value: e.value }))).toEqual([
        { key: "id", value: "1" },
        { key: "id", value: "2" },
      ]);
    });

    it("should generate unique IDs for each entry", () => {
      const result = parseUrlParamsOrdered("https://example.com?id=1&id=2");
      expect(result[0].id).not.toBe(result[1].id);
    });
  });

  describe("buildUrlWithOrderedParams", () => {
    it("should return original URL when no params provided", () => {
      const result = buildUrlWithOrderedParams("https://example.com", []);
      expect(result).toBe("https://example.com");
    });

    it("should preserve order and duplicates", () => {
      const result = buildUrlWithOrderedParams("https://example.com", [
        { id: "1", key: "z", value: "3", enabled: true },
        { id: "2", key: "id", value: "1", enabled: true },
        { id: "3", key: "id", value: "2", enabled: true },
      ]);
      expect(result).toBe("https://example.com?z=3&id=1&id=2");
    });

    it("should respect the enabled flag", () => {
      const result = buildUrlWithOrderedParams("https://example.com", [
        { id: "1", key: "active", value: "true", enabled: true },
        { id: "2", key: "hidden", value: "secret", enabled: false },
      ]);
      expect(result).toBe("https://example.com?active=true");
    });

    it("should handle hash fragments correctly", () => {
      const result = buildUrlWithOrderedParams("https://example.com/page#section", [
        { id: "1", key: "id", value: "123", enabled: true },
      ]);
      expect(result).toBe("https://example.com/page?id=123#section");
    });
  });
});
