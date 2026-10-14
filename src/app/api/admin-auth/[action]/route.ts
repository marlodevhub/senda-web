import { NextResponse } from "next/server";
import { rejectCrossOrigin } from "@/lib/server/same-origin";
import { backendFetch, forwardedHeaders, readJsonSafely, type BackendErrorBody } from "@/lib/server/backend";
import {
  clearAdminChallenge,
  clearAdminSession,
  getAdminChallenge,
  getAdminSession,
  setAdminChallenge,
  setAdminSession,
} from "@/lib/server/admin-session";

type ChallengeResult = { challengeToken: string };
type SessionResult = { token: string };

/** BFF de sesión del administrador (CU-23): el navegador nunca ve el desafío ni el JWT, solo cookies httpOnly. */
export async function POST(request: Request, { params }: { params: Promise<{ action: string }> }) {
  const crossOrigin = rejectCrossOrigin(request);
  if (crossOrigin) {
    return crossOrigin;
  }
  const { action } = await params;

  switch (action) {
    case "login":
      return handleLogin(request);
    case "verify":
      return handleVerify(request);
    case "logout":
      return handleLogout();
    default:
      return NextResponse.json(
        { code: "NOT_FOUND", message: "Esa acción no existe." } satisfies BackendErrorBody,
        { status: 404 },
      );
  }
}

async function handleLogin(request: Request) {
  const body = await request.text();
  const res = await backendFetch("/api/v1/admin/auth/login", {
    method: "POST",
    headers: forwardedHeaders(request),
    body,
  });
  const data = await readJsonSafely<ChallengeResult & BackendErrorBody>(res);
  if (!res.ok || !data) {
    return NextResponse.json(data, { status: res.status });
  }

  await setAdminChallenge(data.challengeToken);
  return new NextResponse(null, { status: 204 });
}

async function handleVerify(request: Request) {
  const challengeToken = await getAdminChallenge();
  if (!challengeToken) {
    return NextResponse.json(
      { code: "CHALLENGE_EXPIRED", message: "El código venció. Vuelve a escribir tu correo y contraseña." },
      { status: 401 },
    );
  }

  const clientBody = await request.json();
  const res = await backendFetch("/api/v1/admin/auth/verify", {
    method: "POST",
    headers: forwardedHeaders(request),
    body: JSON.stringify({ challengeToken, code: clientBody.code }),
  });
  const data = await readJsonSafely<SessionResult & BackendErrorBody>(res);
  if (!res.ok || !data) {
    return NextResponse.json(data, { status: res.status });
  }

  await clearAdminChallenge();
  await setAdminSession(data.token);
  return new NextResponse(null, { status: 204 });
}

async function handleLogout() {
  const token = await getAdminSession();
  if (token) {
    await backendFetch("/api/v1/admin/auth/logout", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => undefined);
  }
  await clearAdminSession();
  return new NextResponse(null, { status: 204 });
}
