import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getJar, updateJarCard } from "@/features/progress/api/jar";
import { queryKeys } from "@/lib/api/query-keys";

export function useJar() {
  return useQuery({ queryKey: queryKeys.jar(), queryFn: getJar });
}

export function useUpdateJarCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ rewriteId, change }: { rewriteId: number; change: { favorite: boolean } | { inJar: false } }) =>
      updateJarCard(rewriteId, change),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.jar() }),
  });
}
