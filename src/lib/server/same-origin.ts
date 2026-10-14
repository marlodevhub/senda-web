import "server-only";
import { NextResponse } from "next/server";

/**
 * Defensa contra CSRF además de SameSite: una petición que cambia datos
 * (POST/PUT/PATCH/DELETE) solo se acepta si su Origin es este mismo sitio.
 * Los navegadores siempre envían Origin en esas peticiones; sin Origin no
 * es un navegador y no hay cookies ajenas que aprovechar.
 */
export function rejectCrossOrigin(request: Request): NextResponse | null {
  if (request.method === "GET" || request.method === "HEAD") {
    return null;
  }
  const origin = request.headers.get("origin");
  if (!origin) {
    return null;
  }
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  let originHost: string | null = null;
  try {
    originHost = new URL(origin).host;
  } catch {
    originHost = null;
  }
  if (originHost !== null && originHost === host) {
    return null;
  }
  return NextResponse.json({ code: "FORBIDDEN_ORIGIN", message: "Origen no permitido." }, { status: 403 });
}
