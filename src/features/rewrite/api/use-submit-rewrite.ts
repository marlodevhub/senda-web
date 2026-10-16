import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitRewrite, type SubmitRewriteInput } from "@/features/rewrite/api/submit-rewrite";
import { queryKeys } from "@/lib/api/query-keys";

/** Al reescribir, la frase deja de estar pendiente: Inicio y el historial ("Por reescribir") se vuelven a pedir. */
export function useSubmitRewrite(journalEntryId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SubmitRewriteInput) => submitRewrite(journalEntryId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.home() });
      void queryClient.invalidateQueries({ queryKey: ["history"] });
    },
  });
}
