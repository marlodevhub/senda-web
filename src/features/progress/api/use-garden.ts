import { useQuery } from "@tanstack/react-query";
import { getGarden } from "@/features/progress/api/get-garden";
import { queryKeys } from "@/lib/api/query-keys";

/** CU-07: también disponible en SOLO_LECTURA, sin datos que cambien seguido. */
export function useGarden() {
  return useQuery({
    queryKey: queryKeys.garden(),
    queryFn: getGarden,
  });
}
