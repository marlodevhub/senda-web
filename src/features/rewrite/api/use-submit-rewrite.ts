import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitRewrite } from "@/features/rewrite/api/submit-rewrite";
import { queryKeys } from "@/lib/api/query-keys";

/**
 * CU-04: cada intento suma una carita al progreso (la guía se vuelve a pedir); el primero saca las frases del
 * registro de "por reescribir", así que Inicio, el historial y el detalle también se vuelven a pedir.
 */
export function useSubmitRewrite(journalEntryId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (text: string) => submitRewrite(journalEntryId, text),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.rewriteGuide(journalEntryId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.home() });
      void queryClient.invalidateQueries({ queryKey: ["history"] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.stats() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.entryDetail(journalEntryId) });
    },
  });
}
