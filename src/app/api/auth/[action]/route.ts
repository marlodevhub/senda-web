import { NextResponse } from "next/server";
import { rejectCrossOrigin } from "@/lib/server/same-origin";
import { backendFetch, forwardedHeaders, readJsonSafely, type BackendErrorBody } from "@/lib/server/backend";
import { clearStudentSession, getStudentSession, setStudentSession } from "@/lib/server/session";

/** `recoveryCode` es null al activar con Google (sin contraseña no hay nada que recuperar con él). */
type ActivationResult = { token: string; refreshToken: string; recoveryCode: string | null };
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
      return handleActivate(request, "/api/v1/auth/activate");
    case "activate-google":
      return handleActivate(request, "/api/v1/auth/activate/google");
    case "login":
      return handleLogin(request, "/api/v1/auth/login");
    case "google":
      return handleLogin(request, "/api/v1/auth/google");
    case "recover":
      return handleRecover(request);
    case "logout":
      return handleLogout();
    default:
      return NextResponse.json({ code: "NOT_FOUND", message: "Esa acción no existe." } satisfies BackendErrorBody, {
        status: 404,
      });
  }
}

/** CU-15: con usuario y contraseña, o con Google (código + ID token); las dos dejan la sesión iniciada. */
async function handleActivate(request: Request, backendPath: string) {
  const body = await request.text();
  const res = await backendFetch(backendPath, {
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

/** Usuario y contraseña (CU-18) o ID token de Google (CU-18/CU-20): las dos terminan en la misma sesión. */
async function handleLogin(request: Request, backendPath: string) {
  const body = await request.text();
  const res = await backendFetch(backendPath, {
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
