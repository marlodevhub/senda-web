import { useQuery } from "@tanstack/react-query";
import { getGuide } from "@/features/rewrite/api/get-guide";
import { queryKeys } from "@/lib/api/query-keys";

/**
 * Sin `findingId`: el servidor propone el hallazgo visible de mayor
 * confianza sin reescribir aún (RN-RE-01). Con `findingId`: recarga la
 * guía de ESE hallazgo (CU-04 alternativa 1a, "Elegir otra frase").
 */
export function useRewriteGuide(journalEntryId: number, findingId?: number) {
  return useQuery({
    queryKey: queryKeys.rewriteGuide(journalEntryId, findingId),
    queryFn: () => getGuide(journalEntryId, findingId),
  });
}
