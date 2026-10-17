import { NextResponse } from "next/server";
import { backendFetch, forwardedHeaders, readJsonSafely } from "@/lib/server/backend";

/**
 * CU-15/CU-20: si un usuario está libre, mientras se escribe. Público (al activar todavía no hay sesión) y de solo
 * lectura; el navegador nunca llama a senda-api directo.
 */
export async function GET(request: Request) {
  const username = new URL(request.url).searchParams.get("username") ?? "";
  const res = await backendFetch(`/api/v1/auth/username-availability?username=${encodeURIComponent(username)}`, {
    headers: forwardedHeaders(request),
  });
  const data = await readJsonSafely<{ status: string }>(res);
  return NextResponse.json(data, { status: res.status, headers: { "Cache-Control": "no-store" } });
}
