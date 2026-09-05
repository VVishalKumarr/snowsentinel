import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/sessionConstants";

// Route protection (Next.js "proxy" — formerly "middleware"): this checks
// for the presence of a session cookie before any protected page is ever
// rendered — an unauthenticated request to /dashboard (or any other
// protected path) is redirected to /login at the edge, not just hidden
// client-side. This is a presence check only (fast, no DB round-trip
// here); full session validity (expired/forged token) is checked
// server-side by /api/auth/me and by every protected API route's own
// getUserFromRequest call, which do query the database.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = !!request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (pathname === "/" || pathname === "/login") {
    if (hasSession) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  if (!hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/dashboard/:path*", "/monitor/:path*", "/analysis/:path*", "/profile/:path*"],
};
