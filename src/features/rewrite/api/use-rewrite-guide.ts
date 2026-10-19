import { useQuery } from "@tanstack/react-query";
import { getGuide } from "@/features/rewrite/api/get-guide";
import { queryKeys } from "@/lib/api/query-keys";

/** CU-04: la reescritura del registro completo y el progreso de sus intentos. */
export function useRewriteGuide(journalEntryId: number) {
  return useQuery({
    queryKey: queryKeys.rewriteGuide(journalEntryId),
    queryFn: () => getGuide(journalEntryId),
  });
}
