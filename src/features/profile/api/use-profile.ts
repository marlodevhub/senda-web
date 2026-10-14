import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getProfile } from "@/features/profile/api/get-profile";
import { changePassword, generateRecoveryCode, updateNotifications } from "@/features/profile/api/profile-settings";
import { queryKeys } from "@/lib/api/query-keys";

export function useProfile() {
  return useQuery({ queryKey: queryKeys.profile(), queryFn: getProfile });
}

export function useChangePassword() {
  return useMutation({ mutationFn: changePassword });
}

export function useGenerateRecoveryCode() {
  return useMutation({ mutationFn: generateRecoveryCode });
}

export function useUpdateNotifications() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateNotifications,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.profile() }),
  });
}
