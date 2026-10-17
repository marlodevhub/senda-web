import { z } from "zod";

/**
 * CU-15/CU-20: el usuario con el que se entra (RN-AC-19). Mismo formato que el dominio de senda-api (`Username`): de 3
 * a 30, minúsculas, números, punto o guion bajo en medio. Sin guion, así nunca se confunde con un código de
 * participante. La verdad la tiene el servidor; esto evita viajes de red por errores obvios.
 */
export const USERNAME_PATTERN = /^[a-z0-9][a-z0-9._]{1,28}[a-z0-9]$/;

export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "validation.usernameRequired")
  .regex(USERNAME_PATTERN, "validation.usernameFormat");
