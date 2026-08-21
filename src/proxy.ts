import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Optimistic auth gate for /api/*. Per Next's own authentication guide,
// Proxy runs on every matched request (including prefetches) and shouldn't
// do database work — so this only checks whether a session cookie is
// present at all. It cannot confirm the cookie is a *live, unexpired*
// session without a DB lookup. That real validation happens in each route
// handler via getCurrentSigner() (src/lib/signer.ts) — this is a cheap
// first filter that blocks the "didn't even try to authenticate" case for
// every /api/* route by default, not the only line of defense.
const PUBLIC_API_PATHS = new Set([
  "/api/auth/login",
  "/api/auth/manager-login",
  "/api/auth/me",
  "/api/auth/manager-me",
  "/api/auth/logout",
  "/api/auth/manager-logout",
  // Has to stay public: the sign-in screen needs the kitchen list to
  // render its location picker before any session exists — there's no
  // way to log in without it.
  "/api/locations",
]);

const COOK_SESSION_COOKIE = "kitchen_session";
const MANAGER_SESSION_COOKIE = "kitchen_manager_session";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/api/") || PUBLIC_API_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  const hasSessionCookie =
    request.cookies.has(COOK_SESSION_COOKIE) || request.cookies.has(MANAGER_SESSION_COOKIE);

  if (!hasSessionCookie) {
    return NextResponse.json({ error: "Sign in first" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
