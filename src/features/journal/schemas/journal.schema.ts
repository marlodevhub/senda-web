import { z } from "zod";
import { JOURNAL_CONTEXTS, type JournalContext } from "@/types/journal-context";

// RN-DI-05: obligatorio (también lo exige el servidor, MISSING_CONTEXT).
const journalContextSchema = z.enum(JOURNAL_CONTEXTS, { error: "journal.missingContext" });

export type { JournalContext };

const journalModeSchema = z.enum(["GUIDED", "FREE"]);

/**
 * RN-DI-03/04 se validan de verdad en el servidor (incluido el conteo de
 * palabras de RS-DI-02); aquí solo se exige lo mínimo para no mandar un
 * formulario a medio llenar — igual que en el resto del formulario.
 */
export const journalFormSchema = z.object({
  moodBefore: z.number().int().min(1).max(5),
  mode: journalModeSchema,
  q1: z.string().optional(),
  q2: z.string().optional(),
  q3: z.string().optional(),
  freeText: z.string().optional(),
  context: journalContextSchema,
});

export type JournalFormValues = z.infer<typeof journalFormSchema>;
