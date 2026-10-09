import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getParticipants, resetAccess } from "@/features/admin/api/participants";
import { queryKeys } from "@/lib/api/query-keys";

export function useParticipants(cohortId: number) {
  return useQuery({
    queryKey: queryKeys.adminParticipants(cohortId),
    queryFn: () => getParticipants(cohortId),
    enabled: cohortId > 0,
  });
}

export function useAccessReset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resetAccess,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-participants"] }),
  });
}
