import { z } from "zod";
import { newPasswordSchema, passwordsMatch } from "@/lib/validation/password";

/** CU-20 2a (RS-AC-13): pide la actual. */
export const changePasswordFormSchema = z
  .object({
    currentPassword: z.string().min(1, "validation.currentPasswordRequired"),
    newPassword: newPasswordSchema,
    newPasswordConfirm: z.string(),
  })
  .refine(...passwordsMatch<{ newPassword: string; newPasswordConfirm: string }>("newPassword", "newPasswordConfirm"));

export type ChangePasswordFormValues = z.infer<typeof changePasswordFormSchema>;

/** CU-20: la primera contraseña de quien activó con Google (no hay una actual que pedir). */
export const setUpPasswordFormSchema = z
  .object({ newPassword: newPasswordSchema, newPasswordConfirm: z.string() })
  .refine(...passwordsMatch<{ newPassword: string; newPasswordConfirm: string }>("newPassword", "newPasswordConfirm"));

export type SetUpPasswordFormValues = z.infer<typeof setUpPasswordFormSchema>;

/** CU-20 2b (RS-AC-13): pide la contraseña. */
export const generateRecoveryCodeFormSchema = z.object({
  password: z.string().min(1, "validation.passwordRequired"),
});

export type GenerateRecoveryCodeFormValues = z.infer<typeof generateRecoveryCodeFormSchema>;

/** CU-20 2c (RS-AC-14): correo válido solo si se activan las notificaciones. */
export const notificationsFormSchema = z.object({
  enabled: z.boolean(),
  email: z.string().email("validation.emailFormat").max(254).optional().or(z.literal("")),
});

export type NotificationsFormValues = z.infer<typeof notificationsFormSchema>;

export const withdrawalOptionSchema = z.enum(["KEEP_DATA", "DELETE_ALL"]);
export type WithdrawalOption = z.infer<typeof withdrawalOptionSchema>;

/** CU-21 paso 3: confirma con su contraseña actual (no las reglas de RN-AC-04, ya la tiene). */
export const withdrawFormSchema = z.object({
  option: withdrawalOptionSchema,
  password: z.string().min(1, "validation.passwordRequired"),
});

export type WithdrawFormValues = z.infer<typeof withdrawFormSchema>;
