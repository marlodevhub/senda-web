import { NextResponse } from "next/server";
import { backendFetch, forwardedHeaders, readJsonSafely } from "@/lib/server/backend";
import { clearStudentSession, getStudentSession, setStudentSession } from "@/lib/server/session";

/**
 * Reenvía cualquier ruta autenticada del estudiante a senda-api con el
 * token que corresponda. Si el access token ya expiró (401), intenta
 * renovarlo una vez con el refresh token antes de rendirse — así ninguna
 * pantalla tiene que saber que el JWT dura solo 30 min (RS-AC-05).
 */
async function proxy(request: Request, pathSegments: string[]) {
  const url = new URL(request.url);
  const targetPath = `/api/v1/${pathSegments.join("/")}${url.search}`;
  const { token, refreshToken } = await getStudentSession();

  if (!token) {
    return NextResponse.json(
      { code: "UNAUTHENTICATED", message: "Inicia sesión para continuar." },
      { status: 401 },
    );
  }

  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  const body = hasBody ? await request.text() : undefined;
  const idempotencyKey = request.headers.get("idempotency-key");

  const forward = (accessToken: string) =>
    backendFetch(targetPath, {
      method: request.method,
      headers: {
        ...forwardedHeaders(request),
        Authorization: `Bearer ${accessToken}`,
        ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
      },
      body,
    });

  let response = await forward(token);

  if (response.status === 401 && refreshToken) {
    const refreshResponse = await backendFetch("/api/v1/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });

    if (refreshResponse.ok) {
      const refreshed = await readJsonSafely<{ token: string; refreshToken: string }>(refreshResponse);
      if (refreshed) {
        await setStudentSession(refreshed);
        response = await forward(refreshed.token);
      }
    } else {
      await clearStudentSession();
    }
  }

  const data = await readJsonSafely(response);
  if (data === null) {
    return new NextResponse(null, { status: response.status });
  }
  return NextResponse.json(data, { status: response.status });
}

type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(request: Request, { params }: RouteContext) {
  return proxy(request, (await params).path);
}

export async function POST(request: Request, { params }: RouteContext) {
  return proxy(request, (await params).path);
}

export async function PUT(request: Request, { params }: RouteContext) {
  return proxy(request, (await params).path);
}

export async function DELETE(request: Request, { params }: RouteContext) {
  return proxy(request, (await params).path);
}
