import { callBff } from "@/lib/api/client";

/** Mismos valores que {@code AuditAction} del backend. */
export const AUDIT_ACTIONS = [
  "ADMIN_LOGIN_SUCCEEDED",
  "ADMIN_LOGIN_FAILED",
  "ADMIN_LOGOUT",
  "COHORT_CREATED",
  "COHORT_UPDATED",
  "COHORT_CLOSED",
  "CODES_GENERATED",
  "PARTICIPANT_ACCESS_RESET",
  "ADHERENCE_EXPORTED",
  "CONFIG_FROZEN",
  "COHORT_START_VERIFICATION_FAILED",
  "PARTICIPANT_WITHDRAWN",
  "PARTICIPANT_DATA_PURGED",
  "DAILY_CLOSING_FAILED",
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export type AuditLogEntry = {
  createdAt: string;
  actor: string;
  action: AuditAction;
  entity: string;
  entityId: string | null;
  participantCode: string | null;
};

export type AuditLogPage = { items: AuditLogEntry[]; hasMore: boolean };

export type AuditFilters = { from: string; to: string; action?: AuditAction; page: number };

/** CU-27 (RS-AD-08): 50 filas por página, máximo 90 días por consulta. */
export async function getAuditLogs(filters: AuditFilters): Promise<AuditLogPage> {
  const params = new URLSearchParams({ from: filters.from, to: filters.to, page: String(filters.page) });
  if (filters.action) {
    params.set("action", filters.action);
  }
  return callBff<AuditLogPage>(`/api/admin/v1/audit-logs?${params.toString()}`);
}

export type FrozenCohortConfig = {
  cohortId: number;
  cohortName: string;
  cohortStatus: string;
  configVersion: string;
  frozenAt: string | null;
  matchesRunning: boolean;
};

export type ConfigStatus = {
  fingerprint: string;
  promptVersion: string;
  lexiconVersion: string;
  provider: string;
  model: string;
  cohorts: FrozenCohortConfig[];
};

/** CU-27 paso 3: configuración vigente y congelada por cohorte. */
export async function getCurrentConfig(): Promise<ConfigStatus> {
  return callBff<ConfigStatus>("/api/admin/v1/config/current");
}
