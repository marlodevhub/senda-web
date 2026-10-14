import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { completeWelcome, getWelcome, updateStartingPoint } from "@/features/welcome/api/welcome";
import { queryKeys } from "@/lib/api/query-keys";

export function useWelcome() {
  return useQuery({ queryKey: queryKeys.welcome(), queryFn: getWelcome });
}

export function useCompleteWelcome() {
  return useMutation({ mutationFn: completeWelcome });
}

export function useUpdateStartingPoint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateStartingPoint,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.welcome() }),
  });
}
