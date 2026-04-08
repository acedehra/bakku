import { describe, it, expect } from "vitest";
import {
  substituteVariables,
  buildAuthHeaders,
  formatError,
} from "../httpClient";
import { Environment, AuthConfig } from "../../types";

describe("httpClient", () => {
  describe("substituteVariables", () => {
    it("should return original text when environment is null", () => {
      const result = substituteVariables("test {{key}} text", null);
      expect(result).toBe("test {{key}} text");
    });

    it("should return original text when text is empty", () => {
      const env: Environment = {
        id: "1",
        name: "Test",
        variables: [{ key: "key", value: "value", enabled: true }],
      };
      const result = substituteVariables("", env);
      expect(result).toBe("");
    });

    it("should substitute enabled variables", () => {
      const env: Environment = {
        id: "1",
        name: "Test",
        variables: [{ key: "name", value: "World", enabled: true }],
      };
      const result = substituteVariables("Hello {{name}}!", env);
      expect(result).toBe("Hello World!");
    });

    it("should not substitute disabled variables", () => {
      const env: Environment = {
        id: "1",
        name: "Test",
        variables: [{ key: "name", value: "World", enabled: false }],
      };
      const result = substituteVariables("Hello {{name}}!", env);
      expect(result).toBe("Hello {{name}}!");
    });

    it("should substitute multiple variables", () => {
      const env: Environment = {
        id: "1",
        name: "Test",
        variables: [
          { key: "firstName", value: "John", enabled: true },
          { key: "lastName", value: "Doe", enabled: true },
        ],
      };
      const result = substituteVariables(
        "{{firstName}} {{lastName}}",
        env
      );
      expect(result).toBe("John Doe");
    });

    it("should substitute all occurrences of a variable", () => {
      const env: Environment = {
        id: "1",
        name: "Test",
        variables: [{ key: "repeat", value: "X", enabled: true }],
      };
      const result = substituteVariables(
        "{{repeat}} {{repeat}} {{repeat}}",
        env
      );
      expect(result).toBe("X X X");
    });

    it("should handle empty variable values", () => {
      const env: Environment = {
        id: "1",
        name: "Test",
        variables: [{ key: "empty", value: "", enabled: true }],
      };
      const result = substituteVariables("Value: {{empty}}", env);
      expect(result).toBe("Value: ");
    });

    it("should sanitize variable values by removing < and >", () => {
      const env: Environment = {
        id: "1",
        name: "Test",
        variables: [
          { key: "xss", value: "<script>alert('xss')</script>", enabled: true },
          { key: "html", value: "<div>content</div>", enabled: true },
        ],
      };
      const result = substituteVariables("{{xss}} {{html}}", env);
      expect(result).toBe("scriptalert('xss')/script divcontent/div");
    });

    it("should escape special regex characters in variable keys", () => {
      const env: Environment = {
        id: "1",
        name: "Test",
        variables: [{ key: "user.name", value: "John", enabled: true }],
      };
      const result = substituteVariables("Hello {{user.name}}!", env);
      expect(result).toBe("Hello John!");
    });
  });

  describe("buildAuthHeaders", () => {
    it("should return empty headers for None auth type", () => {
      const auth: AuthConfig = { type: "None" };
      const result = buildAuthHeaders(auth);
      expect(result).toEqual({});
    });

    it("should build Basic auth headers", () => {
      const auth: AuthConfig = {
        type: "Basic",
        username: "user",
        password: "pass",
      };
      const result = buildAuthHeaders(auth);
      expect(result).toHaveProperty("Authorization");
      expect(result.Authorization).toMatch(/^Basic /);
    });

    it("should use URL-safe encoding for Basic auth credentials", () => {
      const auth: AuthConfig = {
        type: "Basic",
        username: "user@domain.com",
        password: "pass:word/space",
      };
      const result = buildAuthHeaders(auth);
      expect(result).toHaveProperty("Authorization");

      // The credentials should be properly encoded
      const credentials = result.Authorization.replace("Basic ", "");
      const decoded = atob(credentials);
      expect(decoded).toContain("user%40domain.com");
      expect(decoded).toContain("pass%3Aword%2Fspace");
    });

    it("should build Bearer auth headers", () => {
      const auth: AuthConfig = {
        type: "Bearer",
        token: "my-token",
      };
      const result = buildAuthHeaders(auth);
      expect(result).toEqual({ Authorization: "Bearer my-token" });
    });

    it("should build Custom auth headers", () => {
      const auth: AuthConfig = {
        type: "Custom",
        headerName: "X-Custom-Auth",
        headerValue: "custom-value",
      };
      const result = buildAuthHeaders(auth);
      expect(result).toEqual({ "X-Custom-Auth": "custom-value" });
    });

    it("should substitute variables in Basic auth", () => {
      const env: Environment = {
        id: "1",
        name: "Test",
        variables: [{ key: "token", value: "my-token", enabled: true }],
      };
      const auth: AuthConfig = {
        type: "Basic",
        username: "{{token}}",
        password: "pass",
      };
      const result = buildAuthHeaders(auth, env);
      expect(result).toHaveProperty("Authorization");
    });

    it("should substitute variables in Bearer auth", () => {
      const env: Environment = {
        id: "1",
        name: "Test",
        variables: [{ key: "token", value: "my-token", enabled: true }],
      };
      const auth: AuthConfig = {
        type: "Bearer",
        token: "{{token}}",
      };
      const result = buildAuthHeaders(auth, env);
      expect(result).toEqual({ Authorization: "Bearer my-token" });
    });

    it("should substitute variables in Custom auth", () => {
      const env: Environment = {
        id: "1",
        name: "Test",
        variables: [
          { key: "headerName", value: "X-Auth", enabled: true },
          { key: "headerValue", value: "value123", enabled: true },
        ],
      };
      const auth: AuthConfig = {
        type: "Custom",
        headerName: "{{headerName}}",
        headerValue: "{{headerValue}}",
      };
      const result = buildAuthHeaders(auth, env);
      expect(result).toEqual({ "X-Auth": "value123" });
    });
  });

  describe("formatError", () => {
    it("should format DNS resolution errors", () => {
      const error = new Error("Failed to resolve hostname");
      const result = formatError(error);
      expect(result).toContain("Domain not found");
    });

    it("should format invalid URL errors", () => {
      const error = new Error("Invalid URL");
      const result = formatError(error);
      expect(result).toContain("Invalid URL");
    });

    it("should format connection errors", () => {
      const error = new Error("Connection timeout");
      const result = formatError(error);
      expect(result).toContain("Connection error");
    });

    it("should format SSL/TLS errors", () => {
      const error = new Error("SSL certificate error");
      const result = formatError(error);
      expect(result).toContain("SSL/TLS error");
    });

    it("should return descriptive error messages", () => {
      const error = new Error("Some other error");
      const result = formatError(error);
      expect(result).toBe("Some other error");
    });

    it("should handle string errors", () => {
      const result = formatError("String error");
      expect(result).toBe("String error");
    });

    it("should handle unknown errors", () => {
      const result = formatError(null);
      expect(result).toBe("Unknown error");
    });

    it("should handle empty error objects", () => {
      const result = formatError({});
      expect(result).toBe("Unknown error");
    });
  });
});
