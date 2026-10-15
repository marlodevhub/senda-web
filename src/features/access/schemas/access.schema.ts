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

export const activateFormSchema = z
  .object({
    code: activationCodeSchema,
    password: newPasswordSchema,
    passwordConfirm: z.string(),
  })
  .refine(...passwordsMatch<{ password: string; passwordConfirm: string }>("password", "passwordConfirm"));

export type ActivateFormValues = z.infer<typeof activateFormSchema>;

export const loginFormSchema = z.object({
  code: activationCodeSchema,
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
