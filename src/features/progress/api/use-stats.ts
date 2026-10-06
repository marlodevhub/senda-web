import { useQuery } from "@tanstack/react-query";
import { getStats } from "@/features/progress/api/get-stats";
import { queryKeys } from "@/lib/api/query-keys";

/** CU-08: RS-PR-04, el backend ya cachea 5 min por participante; aquí solo se consulta. */
export function useStats() {
  return useQuery({
    queryKey: queryKeys.stats(),
    queryFn: getStats,
  });
}
