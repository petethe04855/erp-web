import { describe, it, expect, vi } from "vitest";
import { proxy } from "@/proxy";
import type { NextRequest } from "next/server";

vi.mock("next/server", () => ({
  NextResponse: {
    redirect: (url: URL) => ({ kind: "redirect", url: String(url) }),
    next: () => ({ kind: "next" }),
  },
}));

function req(path: string, cookie?: string) {
  return {
    url: `http://localhost:3000${path}`,
    nextUrl: new URL(`http://localhost:3000${path}`),
    cookies: { get: (name: string) => (COOKIE_NAMES.includes(name) && cookie ? { value: cookie } : undefined) },
  } as unknown as NextRequest;
}

const COOKIE_NAMES = ["chawy_v2_auth"];

describe("proxy - auth routing", () => {
  it("does NOT redirect authenticated users away from /reset-password (mustResetPassword users live there)", () => {
    const res = proxy(req("/reset-password", "1"));
    expect(res).toEqual({ kind: "next" });
  });

  it("redirects unauthenticated users of protected routes to /login with next param", () => {
    const res = proxy(req("/dashboard", undefined));
    expect(res).toEqual({
      kind: "redirect",
      url: "http://localhost:3000/login?next=%2Fdashboard",
    });
    // /change-password (password reset page) is protected too
    const res2 = proxy(req("/change-password", undefined));
    expect(res2).toEqual({
      kind: "redirect",
      url: "http://localhost:3000/login?next=%2Fchange-password",
    });
  });

  it("redirects authenticated users away from /login and /forgot-password", () => {
    expect(proxy(req("/login", "1"))).toEqual({
      kind: "redirect",
      url: "http://localhost:3000/dashboard",
    });
    expect(proxy(req("/forgot-password", "1"))).toEqual({
      kind: "redirect",
      url: "http://localhost:3000/dashboard",
    });
  });

  it("lets protected routes through when the session cookie exists", () => {
    expect(proxy(req("/dashboard", "1"))).toEqual({ kind: "next" });
  });
});
