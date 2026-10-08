import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMessages } from "@/features/guidance/api/get-messages";
import { openMessage } from "@/features/guidance/api/open-message";
import { queryKeys } from "@/lib/api/query-keys";

/** CU-14: bandeja, solo mensajes ENVIADO (RN-AA-16). */
export function useMessages() {
  return useQuery({
    queryKey: queryKeys.messages(),
    queryFn: getMessages,
  });
}

/** RS-AA-06: idempotente — abrir uno ya abierto no hace nada distinto. */
export function useOpenMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: openMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.messages() });
    },
  });
}
