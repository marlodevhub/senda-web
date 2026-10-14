import { NextResponse } from "next/server";
import { rejectCrossOrigin } from "@/lib/server/same-origin";
import {
  backendFetch,
  forwardedHeaders,
  readJsonSafely,
  type BackendErrorBody,
} from "@/lib/server/backend";
import { clearStudentSession, getStudentSession, setStudentSession } from "@/lib/server/session";

type ActivationResult = { token: string; refreshToken: string; recoveryCode: string };
type LoginResult = { token: string; refreshToken: string; destination: string };

/**
 * BFF de sesión del estudiante: el navegador llama aquí, nunca a
 * senda-api directo. Los tokens se quedan en cookies httpOnly — el
 * cliente solo recibe lo que la pantalla necesita mostrar.
 */
export async function POST(request: Request, { params }: { params: Promise<{ action: string }> }) {
  const crossOrigin = rejectCrossOrigin(request);
  if (crossOrigin) {
    return crossOrigin;
  }
  const { action } = await params;

  switch (action) {
    case "activate":
      return handleActivate(request);
    case "login":
      return handleLogin(request);
    case "recover":
      return handleRecover(request);
    case "logout":
      return handleLogout();
    default:
      return NextResponse.json(
        { code: "NOT_FOUND", message: "Esa acción no existe." } satisfies BackendErrorBody,
        { status: 404 },
      );
  }
}

async function handleActivate(request: Request) {
  const body = await request.text();
  const res = await backendFetch("/api/v1/auth/activate", {
    method: "POST",
    headers: forwardedHeaders(request),
    body,
  });
  const data = await readJsonSafely<ActivationResult & BackendErrorBody>(res);
  if (!res.ok || !data) {
    return NextResponse.json(data, { status: res.status });
  }

  await setStudentSession({ token: data.token, refreshToken: data.refreshToken });
  return NextResponse.json({ recoveryCode: data.recoveryCode }, { status: res.status });
}

async function handleRecover(request: Request) {
  const body = await request.text();
  const res = await backendFetch("/api/v1/auth/recover", {
    method: "POST",
    headers: forwardedHeaders(request),
    body,
  });
  const data = await readJsonSafely<ActivationResult & BackendErrorBody>(res);
  if (!res.ok || !data) {
    return NextResponse.json(data, { status: res.status });
  }

  await setStudentSession({ token: data.token, refreshToken: data.refreshToken });
  return NextResponse.json({ recoveryCode: data.recoveryCode }, { status: res.status });
}

async function handleLogin(request: Request) {
  const body = await request.text();
  const res = await backendFetch("/api/v1/auth/login", {
    method: "POST",
    headers: forwardedHeaders(request),
    body,
  });
  const data = await readJsonSafely<LoginResult & BackendErrorBody>(res);
  if (!res.ok || !data) {
    return NextResponse.json(data, { status: res.status });
  }

  await setStudentSession({ token: data.token, refreshToken: data.refreshToken });
  return NextResponse.json({ destination: data.destination }, { status: res.status });
}

async function handleLogout() {
  const { token } = await getStudentSession();
  if (token) {
    await backendFetch("/api/v1/auth/logout", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => undefined);
  }
  await clearStudentSession();
  return new NextResponse(null, { status: 204 });
}
