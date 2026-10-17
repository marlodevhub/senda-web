import { callBff } from "@/lib/api/client";
import type { Gender } from "@/types/gender";

/** CU-20 2a (RS-AC-13): exige la contraseña actual; el backend cierra las sesiones abiertas. */
export async function changePassword(input: { currentPassword: string; newPassword: string }): Promise<void> {
  await callBff<void>("/api/v1/profile/password", { method: "POST", body: JSON.stringify(input) });
}

/** CU-20: la primera contraseña de quien activó con Google (necesita usuario); devuelve su código de recuperación. */
export async function setUpPassword(input: { newPassword: string }): Promise<{ recoveryCode: string }> {
  return callBff<{ recoveryCode: string }>("/api/v1/profile/password-setup", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/** CU-20 2b (RS-AC-13): el código nuevo se muestra una sola vez y el anterior deja de servir. */
export async function generateRecoveryCode(input: { password: string }): Promise<{ recoveryCode: string }> {
  return callBff<{ recoveryCode: string }>("/api/v1/profile/recovery-code", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/** CU-20: cómo quiere que lo llamen y su sexo (elige el tema de color). */
export async function updateIdentity(input: { preferredName: string; gender: Gender }): Promise<void> {
  await callBff<void>("/api/v1/profile/identity", {
    method: "PUT",
    body: JSON.stringify({ ...input, preferredName: input.preferredName.trim() }),
  });
}

/** CU-20 2c (RN-AC-16): al desactivarlas, el correo se borra. */
export async function updateNotifications(input: { enabled: boolean; email?: string }): Promise<void> {
  await callBff<void>("/api/v1/profile", { method: "PUT", body: JSON.stringify(input) });
}

/** CU-20: el usuario con el que inicia sesión. */
export async function changeUsername(username: string): Promise<void> {
  await callBff<void>("/api/v1/profile/username", { method: "PUT", body: JSON.stringify({ username }) });
}

/** CU-20: vincula la cuenta de Google del ID token (senda-api guarda solo un HMAC de su identificador). */
export async function linkGoogle(idToken: string): Promise<void> {
  await callBff<void>("/api/v1/profile/google", { method: "PUT", body: JSON.stringify({ idToken }) });
}

export async function unlinkGoogle(): Promise<void> {
  await callBff<void>("/api/v1/profile/google", { method: "DELETE" });
}
