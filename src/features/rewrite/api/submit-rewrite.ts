import { callBff } from "@/lib/api/client";

export type RewriteResult = "SOFTENED" | "ALMOST" | "STILL_HARD" | "PENDING" | "RISK";

export type SubmitRewriteResult = {
  rewriteId: number;
  result: RewriteResult;
  attemptNumber: number;
  maxAttempts: number;
};

export type SubmitRewriteInput = {
  findingId: number;
  text: string;
  guideAnswer1?: string;
  guideAnswer2?: string;
  guideAnswer3?: string;
};

export async function submitRewrite(journalEntryId: number, input: SubmitRewriteInput): Promise<SubmitRewriteResult> {
  return callBff<SubmitRewriteResult>(`/api/v1/journal-entries/${journalEntryId}/rewrites`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}
