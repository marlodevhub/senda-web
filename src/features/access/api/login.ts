import { callBff } from "@/lib/api/client";

/** RN-AC-11. */
export type LoginDestination = "CONSENT" | "WELCOME" | "HOME";

export type LoginResult = { destination: LoginDestination };

export async function login(input: { code: string; password: string }): Promise<LoginResult> {
  return callBff<LoginResult>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
