import { z } from "zod";

/**
 * RN-RE-04 se valida de verdad en el servidor (incluida la comparación contra el texto del registro); aquí solo se
 * exige lo mínimo, igual que en el resto de los formularios (ver journal.schema.ts).
 */
export const rewriteFormSchema = z.object({
  text: z.string().min(1, "rewrite.tooShort"),
});

export type RewriteFormValues = z.infer<typeof rewriteFormSchema>;
