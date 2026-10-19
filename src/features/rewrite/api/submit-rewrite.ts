import { callBff } from "@/lib/api/client";

export type RewriteResult = "SOFTENED" | "ALMOST" | "STILL_HARD" | "PENDING" | "RISK";

/** El intento guardado: la carita que le dio la IA (null si no respondió o hubo riesgo) y si ya suena amable. */
export type SubmitRewriteResult = {
  rewriteId: number;
  result: RewriteResult;
  attemptNumber: number;
  mood: 1 | 2 | 3 | 4 | 5 | null;
  completed: boolean;
};

/** CU-04: la reescritura del registro completo (todas sus frases duras en un solo texto). */
export async function submitRewrite(journalEntryId: number, text: string): Promise<SubmitRewriteResult> {
  return callBff<SubmitRewriteResult>(`/api/v1/journal-entries/${journalEntryId}/rewrites`, {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}
