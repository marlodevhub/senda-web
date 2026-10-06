import { useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMirror } from "@/features/analysis/api/get-mirror";
import { confirmMirror } from "@/features/analysis/api/confirm-mirror";
import type { ConfirmationAnswer } from "@/features/analysis/api/get-mirror";
import { queryKeys } from "@/lib/api/query-keys";

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 15000;

/**
 * CU-03 alternativa 1c: mientras el análisis está PENDIENTE, se consulta
 * cada 3 s durante 15 s; pasado ese tiempo se deja de insistir y el
 * resultado aparecerá más tarde en el historial.
 */
export function useMirror(journalEntryId: number) {
  const pendingSinceRef = useRef<number | null>(null);

  return useQuery({
    queryKey: queryKeys.mirror(journalEntryId),
    queryFn: () => getMirror(journalEntryId),
    refetchInterval: (query) => {
      if (query.state.data?.status !== "PENDING") {
        pendingSinceRef.current = null;
        return false;
      }
      if (pendingSinceRef.current === null) {
        pendingSinceRef.current = Date.now();
      }
      if (Date.now() - pendingSinceRef.current >= POLL_TIMEOUT_MS) {
        return false;
      }
      return POLL_INTERVAL_MS;
    },
  });
}

export function useConfirmMirror(journalEntryId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (answer: ConfirmationAnswer) => confirmMirror(journalEntryId, answer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.mirror(journalEntryId) });
    },
  });
}
