import { NextResponse } from "next/server";
import { backendFetch, forwardedHeaders } from "@/lib/server/backend";
import { getAdminSession } from "@/lib/server/admin-session";

/**
 * Reenvía cualquier ruta autenticada del administrador a
 * {@code /api/v1/admin/**} de senda-api con la cookie propia
 * (senda_admin_access) — nunca la del estudiante, nunca con renovación
 * (RS-AD-01). Pasa el cuerpo tal cual (incluido el xlsx binario de
 * CU-25) en vez de asumir JSON, porque esta ruta también sirve la
 * descarga de la exportación.
 */
async function proxy(request: Request, pathSegments: string[]) {
  const url = new URL(request.url);
  const targetPath = `/api/v1/admin/${pathSegments.join("/")}${url.search}`;
  const token = await getAdminSession();

  if (!token) {
    return NextResponse.json(
      { code: "UNAUTHENTICATED", message: "Inicia sesión para continuar." },
      { status: 401 },
    );
  }

  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  const body = hasBody ? await request.text() : undefined;

  const response = await backendFetch(targetPath, {
    method: request.method,
    headers: { ...forwardedHeaders(request), Authorization: `Bearer ${token}` },
    body,
  });

  const responseBody = await response.arrayBuffer();
  const headers = new Headers();
  const contentType = response.headers.get("Content-Type");
  const contentDisposition = response.headers.get("Content-Disposition");
  if (contentType) headers.set("Content-Type", contentType);
  if (contentDisposition) headers.set("Content-Disposition", contentDisposition);

  return new NextResponse(responseBody, { status: response.status, headers });
}

type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(request: Request, { params }: RouteContext) {
  return proxy(request, (await params).path);
}

export async function POST(request: Request, { params }: RouteContext) {
  return proxy(request, (await params).path);
}

export async function PATCH(request: Request, { params }: RouteContext) {
  return proxy(request, (await params).path);
}
