import { z } from "zod";

/**
 * RN-RE-04 se valida de verdad en el servidor (incluida la comparación
 * contra la frase original); aquí solo se exige lo mínimo, igual que en
 * el resto de los formularios (ver journal.schema.ts).
 */
export const rewriteFormSchema = z.object({
  guideAnswer1: z.string().optional(),
  guideAnswer2: z.string().optional(),
  guideAnswer3: z.string().optional(),
  text: z.string().min(1),
});

export type RewriteFormValues = z.infer<typeof rewriteFormSchema>;
