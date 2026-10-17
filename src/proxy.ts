import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { env } from "@/config/env";
import {
  ADMIN_ACCESS_COOKIE,
  STUDENT_ACCESS_COOKIE as ACCESS_COOKIE,
  STUDENT_ACCESS_TTL_SECONDS,
  STUDENT_REFRESH_COOKIE as REFRESH_COOKIE,
  STUDENT_REFRESH_TTL_SECONDS,
  studentCookieOptions,
} from "@/lib/session-cookies";

/** Rutas del estudiante que exigen sesión iniciada (CU-18). */
const PROTECTED_PREFIXES = [
  "/inicio",
  "/diario",
  "/consentimiento",
  "/bienvenida",
  "/progreso",
  "/historial",
  "/mensajes",
  "/perfil",
];

/** Pantallas para entrar: con sesión iniciada no tienen sentido y llevan a Inicio. */
const STUDENT_ENTRY_ROUTES = ["/", "/login", "/activar", "/recuperar"];

/** RS-AD-04: nunca se enlazan desde las del estudiante; /login y /verificar quedan públicas (CU-23 pasos 1-3). */
const ADMIN_PROTECTED_PREFIXES = ["/admin/cohortes", "/admin/participantes", "/admin/adherencia", "/admin/auditoria"];
const ADMIN_ENTRY_ROUTES = ["/admin/login", "/admin/verificar"];

type StudentTokens = { token: string; refreshToken: string };

/**
 * RS-AC-05: la cookie de acceso dura 30 min y la de renovación 7 días. Si
 * solo queda la de renovación, se renueva aquí, en la navegación, para que
 * las pantallas que leen la sesión en el servidor reciban un token válido.
 */
async function refreshStudentSession(request: NextRequest): Promise<StudentTokens | null> {
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  if (!refreshToken) {
    return null;
  }
  try {
    const response = await fetch(`${env.BACKEND_URL}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });
    return response.ok ? ((await response.json()) as StudentTokens) : null;
  } catch {
    return null;
  }
}

function withStudentSession(response: NextResponse, tokens: StudentTokens): NextResponse {
  response.cookies.set(ACCESS_COOKIE, tokens.token, { ...studentCookieOptions, maxAge: STUDENT_ACCESS_TTL_SECONDS });
  response.cookies.set(REFRESH_COOKIE, tokens.refreshToken, {
    ...studentCookieOptions,
    maxAge: STUDENT_REFRESH_TTL_SECONDS,
  });
  return response;
}

function withoutStudentSession(response: NextResponse): NextResponse {
  response.cookies.delete(ACCESS_COOKIE);
  response.cookies.delete(REFRESH_COOKIE);
  return response;
}

/** Los prefetch del router no renuevan: varios a la vez gastarían el mismo token de renovación (se rota en cada uso). */
function isPrefetch(request: NextRequest): boolean {
  return request.headers.has("next-router-prefetch") || request.headers.get("purpose") === "prefetch";
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (ADMIN_ENTRY_ROUTES.includes(pathname)) {
    return request.cookies.has(ADMIN_ACCESS_COOKIE)
      ? NextResponse.redirect(new URL("/admin/cohortes", request.url))
      : NextResponse.next();
  }

  if (ADMIN_PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    if (!request.cookies.has(ADMIN_ACCESS_COOKIE)) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  const hasAccess = request.cookies.has(ACCESS_COOKIE);
  const hasRefresh = request.cookies.has(REFRESH_COOKIE);

  if (STUDENT_ENTRY_ROUTES.includes(pathname)) {
    if (hasAccess) {
      return NextResponse.redirect(new URL("/inicio", request.url));
    }
    if (hasRefresh && !isPrefetch(request)) {
      const tokens = await refreshStudentSession(request);
      return tokens
        ? withStudentSession(NextResponse.redirect(new URL("/inicio", request.url)), tokens)
        : withoutStudentSession(NextResponse.next());
    }
    return NextResponse.next();
  }

  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (!isProtected || hasAccess || isPrefetch(request)) {
    return NextResponse.next();
  }

  const tokens = hasRefresh ? await refreshStudentSession(request) : null;
  if (!tokens) {
    return withoutStudentSession(NextResponse.redirect(new URL("/login", request.url)));
  }
  // La página de esta misma petición también tiene que ver el token nuevo, no solo el navegador.
  request.cookies.set(ACCESS_COOKIE, tokens.token);
  request.cookies.set(REFRESH_COOKIE, tokens.refreshToken);
  return withStudentSession(NextResponse.next({ request }), tokens);
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/activar",
    "/recuperar",
    "/inicio/:path*",
    "/diario/:path*",
    "/consentimiento/:path*",
    "/bienvenida/:path*",
    "/progreso/:path*",
    "/historial/:path*",
    "/mensajes/:path*",
    "/perfil/:path*",
    "/admin/login",
    "/admin/verificar",
    "/admin/cohortes/:path*",
    "/admin/participantes/:path*",
    "/admin/adherencia/:path*",
    "/admin/auditoria/:path*",
  ],
};
