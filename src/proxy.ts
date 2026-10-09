import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ACCESS_COOKIE = "senda_access_token";
const REFRESH_COOKIE = "senda_refresh_token";
const ADMIN_ACCESS_COOKIE = "senda_admin_access";

/** Rutas del estudiante que exigen sesión iniciada (CU-18). */
const PROTECTED_PREFIXES = ["/inicio", "/diario", "/consentimiento"];

/** RS-AD-04: nunca se enlazan desde las del estudiante; /login y /verificar quedan públicas (CU-23 pasos 1-3). */
const ADMIN_PROTECTED_PREFIXES = ["/admin/cohortes", "/admin/participantes", "/admin/adherencia"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (ADMIN_PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    if (!request.cookies.has(ADMIN_ACCESS_COOKIE)) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

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
  matcher: [
    "/inicio/:path*",
    "/diario/:path*",
    "/consentimiento/:path*",
    "/admin/cohortes/:path*",
    "/admin/participantes/:path*",
    "/admin/adherencia/:path*",
  ],
};
