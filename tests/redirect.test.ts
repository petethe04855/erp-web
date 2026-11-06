import { describe, it, expect } from "vitest";
import { sanitizeRedirectPath } from "@/lib/utils";

describe("sanitizeRedirectPath", () => {
  it("allows safe relative internal routes", () => {
    expect(sanitizeRedirectPath("/dashboard")).toBe("/dashboard");
    expect(sanitizeRedirectPath("/inventory")).toBe("/inventory");
    expect(sanitizeRedirectPath("/orders?page=2&status=pending")).toBe("/orders?page=2&status=pending");
    expect(sanitizeRedirectPath("/quotation#details")).toBe("/quotation#details");
  });

  it("rejects protocol-relative open redirect URLs (WEB-TS-01)", () => {
    expect(sanitizeRedirectPath("//evil.example")).toBe("/dashboard");
    expect(sanitizeRedirectPath("//evil.example/phishing")).toBe("/dashboard");
    expect(sanitizeRedirectPath("///evil.example")).toBe("/dashboard");
  });

  it("rejects backslash bypass attempts", () => {
    expect(sanitizeRedirectPath("/\\evil.example")).toBe("/dashboard");
    expect(sanitizeRedirectPath("\\evil.example")).toBe("/dashboard");
  });

  it("rejects full absolute URLs with foreign origins", () => {
    expect(sanitizeRedirectPath("https://evil.example/login")).toBe("/dashboard");
    expect(sanitizeRedirectPath("http://attacker.com")).toBe("/dashboard");
    expect(sanitizeRedirectPath("javascript:alert(1)")).toBe("/dashboard");
  });

  it("falls back to custom default path when provided", () => {
    expect(sanitizeRedirectPath(null, "/custom")).toBe("/custom");
    expect(sanitizeRedirectPath("", "/custom")).toBe("/custom");
    expect(sanitizeRedirectPath("//attacker.com", "/custom")).toBe("/custom");
  });
});
