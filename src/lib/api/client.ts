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
    throw new BffError(response.status, data?.code ?? "UNKNOWN_ERROR", data?.message ?? "Error desconocido.");
  }

  return data as T;
}
