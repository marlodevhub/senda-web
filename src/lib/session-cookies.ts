/**
 * Nombres y atributos de las cookies de sesión del estudiante, compartidos por
 * el BFF (`lib/server/session.ts`) y el proxy de rutas (`proxy.ts`), para que
 * una sesión renovada en cualquiera de los dos quede exactamente igual.
 */
export const STUDENT_ACCESS_COOKIE = "senda_access_token";
export const STUDENT_REFRESH_COOKIE = "senda_refresh_token";
export const ADMIN_ACCESS_COOKIE = "senda_admin_access";

// RS-AC-05: 30 min de acceso + 7 días de renovación — los mismos plazos que emite senda-api.
export const STUDENT_ACCESS_TTL_SECONDS = 30 * 60;
export const STUDENT_REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60;

export const studentCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};
