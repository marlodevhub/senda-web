import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getProfile } from "@/features/profile/api/get-profile";
import {
  changePassword,
  changeUsername,
  linkGoogle,
  unlinkGoogle,
  generateRecoveryCode,
  setUpPassword,
  updateIdentity,
  updateNotifications,
} from "@/features/profile/api/profile-settings";
import { queryKeys } from "@/lib/api/query-keys";

export function useProfile() {
  return useQuery({ queryKey: queryKeys.profile(), queryFn: getProfile });
}

export function useChangePassword() {
  return useMutation({ mutationFn: changePassword });
}

/** El perfil se vuelve a pedir recién cuando guardó su código de recuperación (si no, la tarjeta cambia antes). */
export function useSetUpPassword() {
  return useMutation({ mutationFn: setUpPassword });
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

/** El nombre también sale en el saludo de Inicio. */
export function useUpdateIdentity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateIdentity,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.profile() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.home() });
    },
  });
}

/** CU-20: usuario y Google; al terminar, el perfil se vuelve a pedir. */
function useProfileMutation<TInput>(mutationFn: (input: TInput) => Promise<void>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.profile() }),
  });
}

export const useChangeUsername = () => useProfileMutation(changeUsername);
export const useLinkGoogle = () => useProfileMutation(linkGoogle);
export const useUnlinkGoogle = () => useProfileMutation(() => unlinkGoogle());
