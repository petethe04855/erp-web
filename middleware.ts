import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Edge middleware (erp-web-architecture.md §16): gate protected routes before
 * rendering. This is a fast first-line redirect based on token presence only —
 * the JWT is still validated by the backend on every API call, and
 * SessionGuard (app/(home)/layout.tsx) remains the in-app second layer that
 * verifies the session with GET /auth/me.
 *
 * Token storage is currently localStorage, which middleware cannot read (it
 * runs on the Edge, outside the browser). A chawy_v2_auth cookie is therefore
 * written alongside the token on login and cleared on logout; middleware
 * checks that cookie. The cookie holds no secret material — it mirrors the
 * presence of the session so unauthenticated navigation is redirected before
 * hydration.
 */

const AUTH_COOKIE = "chawy_v2_auth";

/** Routes that require an authenticated session (§16). */
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/sku",
  "/products",
  "/inventory",
  "/orders",
  "/invoices",
  "/customers",
  "/purchase-order",
  "/quotation",
  "/reports",
  "/settings",
  "/users",
  "/goods-receive",
  "/goods-issue",
  "/tiktok-orders",
  "/tiktok-setup",
  "/tiktok-calculator",
];

/** Routes a signed-in user should not sit on. */
const AUTH_ROUTES = ["/login", "/forgot-password", "/reset-password"];

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const hasSessionCookie = Boolean(request.cookies.get(AUTH_COOKIE)?.value);

  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (isProtected && !hasSessionCookie) {
    const loginUrl = new URL("/login", request.url);
    // Preserve the intended destination so login can send the user back.
    const next = `${pathname}${search}`;
    if (next && next !== "/") loginUrl.searchParams.set("next", next);
    return NextResponse.redirect(loginUrl);
  }

  if (hasSessionCookie && AUTH_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Exclude static assets and API routes from middleware processing.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico)$).*)",
  ],
};
