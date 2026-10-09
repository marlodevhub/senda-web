import { z } from "zod";

export const adminLoginFormSchema = z.object({
  email: z.string().min(1, "Escribe tu correo."),
  password: z.string().min(1, "Escribe tu contraseña."),
});
export type AdminLoginFormValues = z.infer<typeof adminLoginFormSchema>;

/** RN-AD-02: TOTP de 6 dígitos. */
export const adminVerifyFormSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "Escribe los 6 dígitos de tu app autenticadora."),
});
export type AdminVerifyFormValues = z.infer<typeof adminVerifyFormSchema>;

export const createCohortFormSchema = z.object({
  name: z.string().min(1, "Escribe un nombre."),
  startDate: z.string().min(1, "Elige una fecha de inicio."),
});
export type CreateCohortFormValues = z.infer<typeof createCohortFormSchema>;

/** RN-AD-06: de 1 a 150 por petición. */
export const generateCodesFormSchema = z.object({
  count: z.coerce.number().int().min(1, "Al menos 1 código.").max(150, "Como máximo 150 códigos."),
});
export type GenerateCodesFormValues = z.infer<typeof generateCodesFormSchema>;
