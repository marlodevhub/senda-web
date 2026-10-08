import { z } from "zod";

export const withdrawalOptionSchema = z.enum(["KEEP_DATA", "DELETE_ALL"]);
export type WithdrawalOption = z.infer<typeof withdrawalOptionSchema>;

/** CU-21 paso 3: confirma con su contraseña actual (no las reglas de RN-AC-04, ya la tiene). */
export const withdrawFormSchema = z.object({
  option: withdrawalOptionSchema,
  password: z.string().min(1, "Escribe tu contraseña."),
});

export type WithdrawFormValues = z.infer<typeof withdrawFormSchema>;
