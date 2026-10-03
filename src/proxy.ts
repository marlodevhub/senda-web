import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ACCESS_COOKIE = "senda_access_token";
const REFRESH_COOKIE = "senda_refresh_token";

/** Rutas del estudiante que exigen sesión iniciada (CU-18). */
const PROTECTED_PREFIXES = ["/inicio", "/diario", "/consentimiento"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (!isProtected) {
    return NextResponse.next();
  }

  const hasSession = request.cookies.has(ACCESS_COOKIE) || request.cookies.has(REFRESH_COOKIE);
  if (!hasSession) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/inicio/:path*", "/diario/:path*", "/consentimiento/:path*"],
};
