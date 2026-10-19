import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateRewrite } from "@/features/rewrite/api/update-rewrite";
import { queryKeys } from "@/lib/api/query-keys";

/** RS-RE-04: "Guardar en mi frasco" la reescritura que quedó amable. */
export function useSaveInJar(journalEntryId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (rewriteId: number) => updateRewrite(rewriteId, true),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.rewriteGuide(journalEntryId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.jar() });
    },
  });
}
