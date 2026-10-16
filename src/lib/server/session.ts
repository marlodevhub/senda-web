import "server-only";
import { cookies } from "next/headers";
import { PALETTE_COOKIE } from "@/lib/palette";

import {
  STUDENT_ACCESS_COOKIE as ACCESS_COOKIE,
  STUDENT_ACCESS_TTL_SECONDS as ACCESS_TTL_SECONDS,
  STUDENT_REFRESH_COOKIE as REFRESH_COOKIE,
  STUDENT_REFRESH_TTL_SECONDS as REFRESH_TTL_SECONDS,
  studentCookieOptions as baseCookie,
} from "@/lib/session-cookies";

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
  // El tema de color es del estudiante que salió: el inicio de sesión vuelve al de siempre.
  store.delete(PALETTE_COOKIE);
}
