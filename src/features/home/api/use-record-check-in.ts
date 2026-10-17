import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Home } from "@/features/home/api/get-home";
import { recordCheckIn } from "@/features/home/api/record-check-in";
import { queryKeys } from "@/lib/api/query-keys";

/**
 * CU-06: el check-in alimenta "Mi ánimo" (RN-PR-06), así que las estadísticas se recalculan. La cara elegida se pone
 * al instante en Inicio (en caché), así el Diario abre con esa cara aunque se entre antes de que responda el servidor.
 */
export function useRecordCheckIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: recordCheckIn,
    onMutate: (mood) => {
      queryClient.setQueryData<Home>(queryKeys.home(), (home) =>
        home ? { ...home, checkinMood: mood, checkinToday: true } : home,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.home() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.stats() });
    },
  });
}
