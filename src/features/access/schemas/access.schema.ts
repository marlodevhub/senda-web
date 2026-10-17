import { z } from "zod";
import { newPasswordSchema, passwordsMatch } from "@/lib/validation/password";

/**
 * RS-AC-01: el formato real (Luhn mod N sobre un alfabeto de 32 símbolos
 * sin O/0/I/1) lo valida el servidor — esto solo evita un viaje de red
 * por un error de tipeo obvio, nunca es la fuente de verdad.
 */
const activationCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .min(1, "validation.codeRequired")
  .regex(/^C\d+-[A-Z0-9]{4}-[A-Z0-9]$/, "validation.codeFormat");

/**
 * CU-15/CU-20: el usuario con el que se entra (el código solo activa). Mismo formato que el dominio del servidor
 * (`Username`): de 3 a 30, minúsculas, números, punto o guion bajo en medio. Sin guion, así no se confunde con un código.
 */
export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "validation.usernameRequired")
  .regex(/^[a-z0-9][a-z0-9._]{1,28}[a-z0-9]$/, "validation.usernameFormat");

export const activateFormSchema = z
  .object({
    code: activationCodeSchema,
    username: usernameSchema,
    password: newPasswordSchema,
    passwordConfirm: z.string(),
  })
  .refine(...passwordsMatch<{ password: string; passwordConfirm: string }>("password", "passwordConfirm"));

export type ActivateFormValues = z.infer<typeof activateFormSchema>;

/** CU-18: el usuario (o, para cuentas activadas antes de existir el usuario, el código de participante). */
export const loginFormSchema = z.object({
  username: z.string().trim().min(1, "validation.usernameRequired"),
  password: z.string().min(1, "validation.passwordRequired"),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

export const recoverFormSchema = z
  .object({
    code: activationCodeSchema,
    recoveryCode: z.string().trim().toUpperCase().min(1, "validation.recoveryCodeRequired"),
    newPassword: newPasswordSchema,
    newPasswordConfirm: z.string(),
  })
  .refine(...passwordsMatch<{ newPassword: string; newPasswordConfirm: string }>("newPassword", "newPasswordConfirm"));

export type RecoverFormValues = z.infer<typeof recoverFormSchema>;
