import { useInfiniteQuery, useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { getHistory, type HistoryFilters } from "@/features/journal/api/get-entries";
import { getEntryDetail, deleteEntry } from "@/features/journal/api/get-entry-detail";
import { queryKeys } from "@/lib/api/query-keys";

/** CU-11 (RN-HI-01/02): "Ver más" acumula páginas de 20 en vez de reemplazarlas. */
export function useHistory(filters: Omit<HistoryFilters, "page">) {
  return useInfiniteQuery({
    queryKey: queryKeys.history(filters),
    queryFn: ({ pageParam }) => getHistory({ ...filters, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => (lastPage.hasMore ? pages.length + 1 : undefined),
  });
}

/** CU-11 (RN-HI-03/04). */
export function useEntryDetail(journalEntryId: number) {
  return useQuery({
    queryKey: queryKeys.entryDetail(journalEntryId),
    queryFn: () => getEntryDetail(journalEntryId),
  });
}

/** CU-12: al eliminar, el historial (toda página/filtro) vuelve a pedirse. */
export function useDeleteEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["history"] });
    },
  });
}
