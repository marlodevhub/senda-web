import { useMutation } from "@tanstack/react-query";
import { updateRewrite, type UpdateRewriteInput } from "@/features/rewrite/api/update-rewrite";

/** RS-RE-04: la Devolución guarda el ánimo posterior y/o "Guardar en mi frasco". */
export function useRewriteFeedback(rewriteId: number) {
  return useMutation({
    mutationFn: (input: UpdateRewriteInput) => updateRewrite(rewriteId, input),
  });
}
