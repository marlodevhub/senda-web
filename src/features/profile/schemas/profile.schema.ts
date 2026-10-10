import { z } from "zod";

/** RN-AC-04 (la misma regla que activar/recuperar). */
const newPasswordSchema = z
  .string()
  .min(8, "Tu contraseña necesita 8 caracteres o más.")
  .regex(/[A-Za-z]/, "Tu contraseña necesita al menos una letra.")
  .regex(/[0-9]/, "Tu contraseña necesita al menos un número.");

/** CU-20 2a (RS-AC-13): pide la actual. */
export const changePasswordFormSchema = z
  .object({
    currentPassword: z.string().min(1, "Escribe tu contraseña actual."),
    newPassword: newPasswordSchema,
    newPasswordConfirm: z.string(),
  })
  .refine((data) => data.newPassword === data.newPasswordConfirm, {
    message: "Las contraseñas no coinciden.",
    path: ["newPasswordConfirm"],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordFormSchema>;

/** CU-20 2b (RS-AC-13): pide la contraseña. */
export const generateRecoveryCodeFormSchema = z.object({
  password: z.string().min(1, "Escribe tu contraseña."),
});

export type GenerateRecoveryCodeFormValues = z.infer<typeof generateRecoveryCodeFormSchema>;

/** CU-20 2c (RS-AC-14): correo válido solo si se activan las notificaciones. */
export const notificationsFormSchema = z.object({
  enabled: z.boolean(),
  email: z.string().email("Escribe un correo válido.").max(254).optional().or(z.literal("")),
});

export type NotificationsFormValues = z.infer<typeof notificationsFormSchema>;

export const withdrawalOptionSchema = z.enum(["KEEP_DATA", "DELETE_ALL"]);
export type WithdrawalOption = z.infer<typeof withdrawalOptionSchema>;

/** CU-21 paso 3: confirma con su contraseña actual (no las reglas de RN-AC-04, ya la tiene). */
export const withdrawFormSchema = z.object({
  option: withdrawalOptionSchema,
  password: z.string().min(1, "Escribe tu contraseña."),
});

export type WithdrawFormValues = z.infer<typeof withdrawFormSchema>;
