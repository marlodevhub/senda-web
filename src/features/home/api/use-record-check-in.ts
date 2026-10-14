import { useMutation, useQueryClient } from "@tanstack/react-query";
import { recordCheckIn } from "@/features/home/api/record-check-in";
import { queryKeys } from "@/lib/api/query-keys";

/** CU-06: el check-in alimenta "Mi ánimo" (RN-PR-06), así que las estadísticas se recalculan. */
export function useRecordCheckIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: recordCheckIn,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.home() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.stats() });
    },
  });
}
