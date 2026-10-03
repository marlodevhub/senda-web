import "server-only";
import { env } from "@/config/env";

export type BackendErrorBody = { code: string; message: string };

/**
 * Llama a senda-api. Nunca se usa desde un componente cliente — por eso
 * "server-only": si algo del navegador lo importa, el build falla antes
 * de filtrar la URL interna del backend.
 */
export async function backendFetch(path: string, init: RequestInit = {}): Promise<Response> {
  return fetch(`${env.BACKEND_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
    cache: "no-store",
  });
}

/**
 * RS-AC-03: el filtro de intentos del backend identifica el origen por
 * IP + user-agent. Si el BFF llama a senda-api sin reenviar estos
 * encabezados, todo el tráfico de Next.js parecería un solo origen.
 */
export function forwardedHeaders(request: Request): HeadersInit {
  const headers: Record<string, string> = {};
  const forwardedFor = request.headers.get("x-forwarded-for");
  const userAgent = request.headers.get("user-agent");
  if (forwardedFor) headers["X-Forwarded-For"] = forwardedFor;
  if (userAgent) headers["User-Agent"] = userAgent;
  return headers;
}

export async function readJsonSafely<T>(response: Response): Promise<T | null> {
  const text = await response.text();
  if (!text) return null;
  return JSON.parse(text) as T;
}
