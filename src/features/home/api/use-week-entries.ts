import { useQuery } from "@tanstack/react-query";
import { getWeekEntries } from "@/features/home/api/get-week-entries";
import { queryKeys } from "@/lib/api/query-keys";

/** Los registros de una semana de la senda, para el detalle del día tocado en el calendario de Inicio. */
export function useWeekEntries(week: number, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.homeWeekEntries(week),
    queryFn: () => getWeekEntries(week),
    enabled,
  });
}
