import { useQuery } from "@tanstack/react-query";
import { getHome } from "@/features/home/api/get-home";
import { queryKeys } from "@/lib/api/query-keys";

/** CU-05: estado del día; también disponible en SOLO_LECTURA (RN-IN-06). */
export function useHome() {
  return useQuery({
    queryKey: queryKeys.home(),
    queryFn: getHome,
  });
}
