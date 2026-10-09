import { useQuery } from "@tanstack/react-query";
import { getAdherence } from "@/features/admin/api/adherence";
import { queryKeys } from "@/lib/api/query-keys";

export function useAdherence(cohortId: number) {
  return useQuery({
    queryKey: queryKeys.adminAdherence(cohortId),
    queryFn: () => getAdherence(cohortId),
    enabled: cohortId > 0,
  });
}
