import "server-only";
import { cookies } from "next/headers";

const ACCESS_COOKIE = "senda_access_token";
const REFRESH_COOKIE = "senda_refresh_token";

// RS-AC-05: 30 min de acceso + 7 días de renovación — los mismos plazos que emite senda-api.
const ACCESS_TTL_SECONDS = 30 * 60;
const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60;

const baseCookie = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export type StudentTokens = { token: string; refreshToken: string };

/** El navegador nunca ve estos valores: solo viajan como cookies httpOnly entre el BFF y el propio navegador. */
export async function setStudentSession(tokens: StudentTokens) {
  const store = await cookies();
  store.set(ACCESS_COOKIE, tokens.token, { ...baseCookie, maxAge: ACCESS_TTL_SECONDS });
  store.set(REFRESH_COOKIE, tokens.refreshToken, { ...baseCookie, maxAge: REFRESH_TTL_SECONDS });
}

export async function getStudentSession(): Promise<Partial<StudentTokens>> {
  const store = await cookies();
  return {
    token: store.get(ACCESS_COOKIE)?.value,
    refreshToken: store.get(REFRESH_COOKIE)?.value,
  };
}

export async function clearStudentSession() {
  const store = await cookies();
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
}
