import { callBff } from "@/lib/api/client";

/** RN-AC-11. */
export type LoginDestination = "CONSENT" | "WELCOME" | "HOME";

export type LoginResult = { destination: LoginDestination };

export async function login(input: { username: string; password: string }): Promise<LoginResult> {
  return callBff<LoginResult>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/** CU-18: con el ID token que entregó Google Identity Services; el BFF lo pasa a senda-api y guarda la sesión. */
export async function loginWithGoogle(idToken: string): Promise<LoginResult> {
  return callBff<LoginResult>("/api/auth/google", {
    method: "POST",
    body: JSON.stringify({ idToken }),
  });
}
