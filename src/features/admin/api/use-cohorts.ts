import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { closeCohort, createCohort, generateCodes, getCohorts } from "@/features/admin/api/cohorts";
import { queryKeys } from "@/lib/api/query-keys";

export function useCohorts() {
  return useQuery({ queryKey: queryKeys.adminCohorts(), queryFn: getCohorts });
}

export function useCreateCohort() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCohort,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.adminCohorts() }),
  });
}

export function useCloseCohort() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: closeCohort,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.adminCohorts() }),
  });
}

export function useGenerateCodes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ cohortId, count }: { cohortId: number; count: number }) => generateCodes(cohortId, count),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.adminCohorts() }),
  });
}
