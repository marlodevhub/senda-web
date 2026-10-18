import { z } from "zod";

export const adminLoginFormSchema = z.object({
  email: z.string().min(1, "validation.emailRequired"),
  password: z.string().min(1, "validation.passwordRequired"),
});
export type AdminLoginFormValues = z.infer<typeof adminLoginFormSchema>;

/** CU-28 paso 1 (RN-AD-02): código de invitación, correo y una contraseña de 12+ con letras, números y un símbolo. */
export const adminEnrollmentFormSchema = z
  .object({
    code: z.string().trim().min(1, "validation.codeRequired"),
    email: z.string().trim().min(1, "validation.emailRequired").email("validation.emailFormat"),
    password: z
      .string()
      .min(12, "validation.adminPasswordTooShort")
      .regex(/\p{L}/u, "validation.passwordNeedsLetter")
      .regex(/\d/, "validation.passwordNeedsNumber")
      .regex(/[^\p{L}\d]/u, "validation.adminPasswordNeedsSymbol"),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "validation.passwordMismatch",
    path: ["confirmPassword"],
  });
export type AdminEnrollmentFormValues = z.infer<typeof adminEnrollmentFormSchema>;

/** RN-AD-02: TOTP de 6 dígitos. */
export const adminVerifyFormSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "validation.totpFormat"),
});
export type AdminVerifyFormValues = z.infer<typeof adminVerifyFormSchema>;

export const createCohortFormSchema = z.object({
  name: z.string().min(1, "validation.nameRequired"),
  startDate: z.string().min(1, "validation.startDateRequired"),
});
export type CreateCohortFormValues = z.infer<typeof createCohortFormSchema>;

/** RN-AD-06: de 1 a 150 por petición. */
export const generateCodesFormSchema = z.object({
  count: z.coerce.number().int().min(1, "validation.codesMin").max(150, "validation.codesMax"),
});
export type GenerateCodesFormValues = z.infer<typeof generateCodesFormSchema>;
