import { callBff } from "@/lib/api/client";

/** `recoveryCode`: solo al activar con contraseña; con Google es null. */
export type ActivationResult = { recoveryCode: string | null };

/** CU-15 para quien no usa Google: el código, el usuario y la contraseña. */
export async function activateAccount(input: {
  code: string;
  username: string;
  password: string;
}): Promise<ActivationResult> {
  return callBff<ActivationResult>("/api/auth/activate", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/** CU-15 con Google: el código prueba la invitación y la cuenta de Google queda como su forma de entrar. */
export async function activateAccountWithGoogle(input: { code: string; idToken: string }): Promise<ActivationResult> {
  return callBff<ActivationResult>("/api/auth/activate-google", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
