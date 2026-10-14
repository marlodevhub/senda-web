import { clearLocalStudentData } from "@/lib/local-student-data";

export class BffError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

type ApiErrorBody = { code?: string; message?: string };

/**
 * CU-18: si el BFF ya no pudo renovar la sesión, no tiene sentido quedarse en
 * una pantalla rota: se vuelve al ingreso que corresponde. Sin consentimiento
 * (RS-AC-09), a aceptarlo. Las credenciales mal escritas tienen otros códigos.
 */
function redirectIfSessionLost(path: string, status: number, code: string | undefined) {
  if (typeof window === "undefined") {
    return;
  }
  const isAdmin = path.startsWith("/api/admin");
  // Recarga completa a propósito: al perder la sesión se descarta todo el estado en memoria
  // (caché de TanStack Query incluida); este módulo tampoco tiene acceso al router.
  /* eslint-disable @next/next/no-location-assign-relative-destination */
  if (status === 401 && (code === "UNAUTHENTICATED" || code === "INVALID_REFRESH_TOKEN")) {
    if (!isAdmin) {
      clearLocalStudentData();
    }
    window.location.assign(isAdmin ? "/admin/login" : "/login");
  } else if (!isAdmin && status === 403 && code === "CONSENT_REQUIRED") {
    window.location.assign("/consentimiento");
  }
  /* eslint-enable @next/next/no-location-assign-relative-destination */
}

/**
 * Único punto por el que el navegador habla con el mundo: siempre al BFF
 * propio (`/api/*`), nunca a `senda-api` directo (sección 1 de
 * senda-web/CLAUDE.md).
 */
export async function callBff<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  const text = await response.text();
  const data = text ? (JSON.parse(text) as T & ApiErrorBody) : null;

  if (!response.ok) {
    redirectIfSessionLost(path, response.status, data?.code);
    throw new BffError(response.status, data?.code ?? "UNKNOWN_ERROR", data?.message ?? "Error desconocido.");
  }

  return data as T;
}
