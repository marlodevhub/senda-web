import "server-only";
import { cookies } from "next/headers";

const CHALLENGE_COOKIE = "senda_admin_challenge";
const ACCESS_COOKIE = "senda_admin_access";

// RN-AD-02 paso 2: desafío de 5 min. RS-AD-01: sesión de 15 min, sin renovación.
const CHALLENGE_TTL_SECONDS = 5 * 60;
const ACCESS_TTL_SECONDS = 15 * 60;

const baseCookie = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  // RS-AD-01: SameSite=Strict — más estricto que la cookie del estudiante, el panel nunca se enlaza desde fuera.
  sameSite: "strict" as const,
  path: "/",
};

/** Entre POST /admin/login y /admin/verify — nunca llega al JS del navegador. */
export async function setAdminChallenge(challengeToken: string) {
  const store = await cookies();
  store.set(CHALLENGE_COOKIE, challengeToken, { ...baseCookie, maxAge: CHALLENGE_TTL_SECONDS });
}

export async function getAdminChallenge(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(CHALLENGE_COOKIE)?.value;
}

export async function clearAdminChallenge() {
  const store = await cookies();
  store.delete(CHALLENGE_COOKIE);
}

export async function setAdminSession(token: string) {
  const store = await cookies();
  store.set(ACCESS_COOKIE, token, { ...baseCookie, maxAge: ACCESS_TTL_SECONDS });
}

export async function getAdminSession(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(ACCESS_COOKIE)?.value;
}

export async function clearAdminSession() {
  const store = await cookies();
  store.delete(ACCESS_COOKIE);
}
