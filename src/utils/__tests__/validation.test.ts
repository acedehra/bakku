import { describe, it, expect } from "vitest";
import {
    validateUrl,
    validateHeaderName,
    validateHeaderValue,
    validateHeaders,
    validateBasicAuth,
    validateBearerAuth,
    validateCustomAuth,
    validateAuth,
    validateRequestBody,
    validateParamKey,
    validateParamValue,
    validateParams,
    validateVariableKey,
    validateVariableValue,
    validateEnvironment,
} from "../validation";

describe("validation", () => {
    describe("validateUrl", () => {
        it("should reject empty URLs", () => {
            const result = validateUrl("");
            expect(result.isValid).toBe(false);
            expect(result.error).toContain("cannot be empty");
        });

        it("should reject URLs without protocol", () => {
            const result = validateUrl("example.com");
            expect(result.isValid).toBe(false);
            expect(result.error).toContain("protocol");
        });

        it("should accept valid HTTPS URLs", () => {
            const result = validateUrl("https://api.example.com/users");
            expect(result.isValid).toBe(true);
        });

        it("should accept valid HTTP URLs", () => {
            const result = validateUrl("http://api.example.com/users");
            expect(result.isValid).toBe(true);
        });

        it("should reject FTP URLs", () => {
            const result = validateUrl("ftp://example.com/file");
            expect(result.isValid).toBe(false);
        });

        it("should accept WS URLs", () => {
            const result = validateUrl("ws://example.com/socket");
            expect(result.isValid).toBe(true);
        });

        it("should accept WSS URLs", () => {
            const result = validateUrl("wss://example.com/socket");
            expect(result.isValid).toBe(true);
        });

        it("should reject malformed URLs", () => {
            const result = validateUrl("not a url");
            expect(result.isValid).toBe(false);
        });

        it("should accept URLs with query parameters", () => {
            const result = validateUrl("https://api.example.com/users?page=1");
            expect(result.isValid).toBe(true);
        });

        it("should accept URLs with fragments", () => {
            const result = validateUrl("https://api.example.com/users#section");
            expect(result.isValid).toBe(true);
        });
    });

    describe("validateHeaderName", () => {
        it("should reject empty header names", () => {
            const result = validateHeaderName("");
            expect(result.isValid).toBe(false);
        });

        it("should accept valid header names", () => {
            const result = validateHeaderName("Content-Type");
            expect(result.isValid).toBe(true);
        });

        it("should reject non-ASCII characters", () => {
            const result = validateHeaderName("Héader");
            expect(result.isValid).toBe(false);
        });

        it("should reject invalid characters", () => {
            const result = validateHeaderName("Header(1)");
            expect(result.isValid).toBe(false);
        });

        it("should accept hyphens in header names", () => {
            const result = validateHeaderName("X-Custom-Header");
            expect(result.isValid).toBe(true);
        });

        it("should accept standard HTTP headers", () => {
            expect(validateHeaderName("Authorization").isValid).toBe(true);
            expect(validateHeaderName("Accept").isValid).toBe(true);
            expect(validateHeaderName("Content-Type").isValid).toBe(true);
        });
    });

    describe("validateHeaderValue", () => {
        it("should accept empty values", () => {
            const result = validateHeaderValue("");
            expect(result.isValid).toBe(true);
        });

        it("should accept valid values", () => {
            const result = validateHeaderValue("application/json");
            expect(result.isValid).toBe(true);
        });

        it("should reject control characters", () => {
            const result = validateHeaderValue("value\x00control");
            expect(result.isValid).toBe(false);
        });

        it("should accept common header values", () => {
            expect(validateHeaderValue("Bearer token123").isValid).toBe(true);
            expect(validateHeaderValue("UTF-8").isValid).toBe(true);
        });
    });

    describe("validateHeaders", () => {
        it("should accept empty headers array", () => {
            const result = validateHeaders([]);
            expect(result.isValid).toBe(true);
        });

        it("should validate multiple headers", () => {
            const result = validateHeaders([
                { id: "1", key: "Content-Type", value: "application/json", enabled: true },
                { id: "2", key: "Authorization", value: "Bearer token", enabled: true },
            ]);
            expect(result.isValid).toBe(true);
        });

        it("should reject invalid header names", () => {
            const result = validateHeaders([
                { id: "1", key: "Invalid(Header)", value: "value", enabled: true },
            ]);
            expect(result.isValid).toBe(false);
        });

        it("should reject invalid header values", () => {
            const result = validateHeaders([
                { id: "1", key: "X-Custom", value: "value\x00", enabled: true },
            ]);
            expect(result.isValid).toBe(false);
        });

        it("should skip disabled headers", () => {
            const result = validateHeaders([
                { id: "1", key: "Invalid(Header)", value: "value", enabled: false },
            ]);
            expect(result.isValid).toBe(true);
        });
    });

    describe("validateBasicAuth", () => {
        it("should reject empty username", () => {
            const result = validateBasicAuth("", "password");
            expect(result.isValid).toBe(false);
        });

        it("should accept valid credentials", () => {
            const result = validateBasicAuth("user", "pass");
            expect(result.isValid).toBe(true);
        });

        it("should reject too long username", () => {
            const result = validateBasicAuth("a".repeat(1025), "pass");
            expect(result.isValid).toBe(false);
        });

        it("should reject too long password", () => {
            const result = validateBasicAuth("user", "a".repeat(8193));
            expect(result.isValid).toBe(false);
        });
    });

    describe("validateBearerAuth", () => {
        it("should reject empty token", () => {
            const result = validateBearerAuth("");
            expect(result.isValid).toBe(false);
        });

        it("should accept valid token", () => {
            const result = validateBearerAuth("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9");
            expect(result.isValid).toBe(true);
        });

        it("should reject too long token", () => {
            const result = validateBearerAuth("a".repeat(8193));
            expect(result.isValid).toBe(false);
        });
    });

    describe("validateCustomAuth", () => {
        it("should validate header name", () => {
            const result = validateCustomAuth("Invalid", "value");
            expect(result.isValid).toBe(true);
        });

        it("should validate both name and value", () => {
            const result = validateCustomAuth("X-Auth-Token", "secret123");
            expect(result.isValid).toBe(true);
        });
    });

    describe("validateAuth", () => {
        it("should validate None auth", () => {
            const result = validateAuth({ type: "None" });
            expect(result.isValid).toBe(true);
        });

        it("should validate Basic auth", () => {
            const result = validateAuth({
                type: "Basic",
                username: "user",
                password: "pass",
            });
            expect(result.isValid).toBe(true);
        });

        it("should validate Bearer auth", () => {
            const result = validateAuth({
                type: "Bearer",
                token: "token123",
            });
            expect(result.isValid).toBe(true);
        });

        it("should validate Custom auth", () => {
            const result = validateAuth({
                type: "Custom",
                headerName: "X-Auth",
                headerValue: "value",
            });
            expect(result.isValid).toBe(true);
        });

        it("should reject invalid auth type", () => {
            const result = validateAuth({ type: "Invalid" } as any);
            expect(result.isValid).toBe(false);
        });
    });

    describe("validateRequestBody", () => {
        it("should accept empty body", () => {
            const result = validateRequestBody("");
            expect(result.isValid).toBe(true);
        });

        it("should accept valid JSON body", () => {
            const result = validateRequestBody('{"key": "value"}', "application/json");
            expect(result.isValid).toBe(true);
        });

        it("should reject invalid JSON body", () => {
            const result = validateRequestBody('{invalid json}', "application/json");
            expect(result.isValid).toBe(false);
        });

        it("should reject too large body", () => {
            const result = validateRequestBody("a".repeat(10 * 1024 * 1024 + 1));
            expect(result.isValid).toBe(false);
        });

        it("should accept non-JSON body for other content types", () => {
            const result = validateRequestBody("plain text", "text/plain");
            expect(result.isValid).toBe(true);
        });
    });

    describe("validateParamKey", () => {
        it("should reject empty keys", () => {
            const result = validateParamKey("");
            expect(result.isValid).toBe(false);
        });

        it("should accept valid keys", () => {
            const result = validateParamKey("page");
            expect(result.isValid).toBe(true);
        });

        it("should reject too long keys", () => {
            const result = validateParamKey("a".repeat(1025));
            expect(result.isValid).toBe(false);
        });
    });

    describe("validateParamValue", () => {
        it("should accept empty values", () => {
            const result = validateParamValue("");
            expect(result.isValid).toBe(true);
        });

        it("should accept valid values", () => {
            const result = validateParamValue("value");
            expect(result.isValid).toBe(true);
        });

        it("should reject too long values", () => {
            const result = validateParamValue("a".repeat(4097));
            expect(result.isValid).toBe(false);
        });
    });

    describe("validateParams", () => {
        it("should accept empty params", () => {
            const result = validateParams([]);
            expect(result.isValid).toBe(true);
        });

        it("should validate multiple params", () => {
            const result = validateParams([
                { id: "1", key: "page", value: "1", enabled: true },
                { id: "2", key: "limit", value: "10", enabled: true },
            ]);
            expect(result.isValid).toBe(true);
        });

        it("should skip empty param keys", () => {
            const result = validateParams([
                { id: "1", key: "", value: "value", enabled: true },
            ]);
            expect(result.isValid).toBe(true); // Empty keys are skipped
        });

        it("should skip disabled params", () => {
            const result = validateParams([
                { id: "1", key: "a".repeat(1025), value: "value", enabled: false },
            ]);
            expect(result.isValid).toBe(true);
        });
    });

    describe("validateVariableKey", () => {
        it("should reject empty keys", () => {
            const result = validateVariableKey("");
            expect(result.isValid).toBe(false);
        });

        it("should accept valid keys", () => {
            const result = validateVariableKey("API_URL");
            expect(result.isValid).toBe(true);
        });

        it("should reject keys with variable syntax", () => {
            const result = validateVariableKey("{{key}}");
            expect(result.isValid).toBe(false);
        });

        it("should reject too long keys", () => {
            const result = validateVariableKey("a".repeat(257));
            expect(result.isValid).toBe(false);
        });
    });

    describe("validateVariableValue", () => {
        it("should accept empty values", () => {
            const result = validateVariableValue("");
            expect(result.isValid).toBe(true);
        });

        it("should accept valid values", () => {
            const result = validateVariableValue("value");
            expect(result.isValid).toBe(true);
        });

        it("should reject too long values", () => {
            const result = validateVariableValue("a".repeat(8193));
            expect(result.isValid).toBe(false);
        });
    });

    describe("validateEnvironment", () => {
        it("should reject empty name", () => {
            const result = validateEnvironment({
                id: "1",
                name: "",
                variables: [],
            });
            expect(result.isValid).toBe(false);
        });

        it("should accept valid environment", () => {
            const result = validateEnvironment({
                id: "1",
                name: "Production",
                variables: [
                    { key: "API_URL", value: "https://api.example.com", enabled: true },
                ],
            });
            expect(result.isValid).toBe(true);
        });

        it("should reject too long name", () => {
            const result = validateEnvironment({
                id: "1",
                name: "a".repeat(101),
                variables: [],
            });
            expect(result.isValid).toBe(false);
        });

        it("should validate variables", () => {
            const result = validateEnvironment({
                id: "1",
                name: "Production",
                variables: [
                    { key: "", value: "value", enabled: true },
                ],
            });
            expect(result.isValid).toBe(false);
        });
    });
});
