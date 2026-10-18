import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Home } from "@/features/home/api/get-home";
import { recordCheckIn } from "@/features/home/api/record-check-in";
import { queryKeys } from "@/lib/api/query-keys";
import { setDraftMood } from "@/lib/local-student-data";

/**
 * CU-06: el check-in alimenta "Mi ánimo" (RN-PR-06), así que las estadísticas se recalculan. La cara elegida se pone
 * al instante en Inicio (en caché) y en el borrador del Diario, así el Diario abre con esa cara por donde se entre y
 * aunque se entre antes de que responda el servidor.
 */
export function useRecordCheckIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: recordCheckIn,
    onMutate: (mood) => {
      queryClient.setQueryData<Home>(queryKeys.home(), (home) =>
        home ? { ...home, checkinMood: mood, checkinToday: true } : home,
      );
      setDraftMood(mood);
    },
    onSuccess: (result) => {
      queryClient.setQueryData<Home>(queryKeys.home(), (home) =>
        home ? { ...home, checkinMood: result.mood, checkinAt: result.recordedAt } : home,
      );
      void queryClient.invalidateQueries({ queryKey: queryKeys.home() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.stats() });
    },
  });
}
