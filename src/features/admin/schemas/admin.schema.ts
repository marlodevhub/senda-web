import { z } from "zod";

export const adminLoginFormSchema = z.object({
  email: z.string().min(1, "validation.emailRequired"),
  password: z.string().min(1, "validation.passwordRequired"),
});
export type AdminLoginFormValues = z.infer<typeof adminLoginFormSchema>;

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
