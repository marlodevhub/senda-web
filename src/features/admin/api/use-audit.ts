import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getAuditLogs, getCurrentConfig, type AuditFilters } from "@/features/admin/api/audit";
import { queryKeys } from "@/lib/api/query-keys";

export function useAuditLogs(filters: AuditFilters, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.adminAuditLogs(filters),
    queryFn: () => getAuditLogs(filters),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useCurrentConfig() {
  return useQuery({ queryKey: queryKeys.adminConfig(), queryFn: getCurrentConfig });
}
