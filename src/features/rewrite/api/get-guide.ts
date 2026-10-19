import { callBff } from "@/lib/api/client";
import type { Dimension } from "@/types/dimension";
import type { RewriteResult } from "@/features/rewrite/api/submit-rewrite";

/** Una frase dura del registro, con su tipo. */
export type GuidePhrase = { findingId: number; dimension: Dimension; pattern: string; fragment: string };

/** Un intento de reescribir el registro: su texto y la carita que le dio la IA (null si no respondió). */
export type GuideAttempt = {
  rewriteId: number;
  attemptNumber: number;
  text: string;
  mood: 1 | 2 | 3 | 4 | 5 | null;
  result: RewriteResult;
  inJar: boolean;
};

/**
 * CU-04: reescribir el registro completo — sus frases duras, la ayuda (de la frase principal) y el progreso de los
 * intentos. `completed`: el último intento ya suena amable (verde).
 */
export type Guide = {
  phrases: GuidePhrase[];
  dimension: Dimension;
  pattern: string;
  questions: string[];
  examples: string[];
  attempts: GuideAttempt[];
  completed: boolean;
};

export async function getGuide(journalEntryId: number): Promise<Guide> {
  return callBff<Guide>(`/api/v1/journal-entries/${journalEntryId}/rewrites/guide`);
}
