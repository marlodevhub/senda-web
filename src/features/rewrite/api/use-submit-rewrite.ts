import { useMutation } from "@tanstack/react-query";
import { submitRewrite, type SubmitRewriteInput } from "@/features/rewrite/api/submit-rewrite";

export function useSubmitRewrite(journalEntryId: number) {
  return useMutation({
    mutationFn: (input: SubmitRewriteInput) => submitRewrite(journalEntryId, input),
  });
}
