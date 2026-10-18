import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createAdminInvitation, getAdminInvitations } from "@/features/admin/api/invitations";
import { queryKeys } from "@/lib/api/query-keys";

export function useAdminInvitations() {
  return useQuery({ queryKey: queryKeys.adminInvitations(), queryFn: getAdminInvitations });
}

export function useCreateAdminInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAdminInvitation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.adminInvitations() }),
  });
}
