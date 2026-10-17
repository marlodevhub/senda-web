/** Claves de TanStack Query centralizadas (senda-web/CLAUDE.md sección 5). */
export const queryKeys = {
  mirror: (journalEntryId: number) => ["mirror", journalEntryId] as const,
  rewriteGuide: (journalEntryId: number, findingId?: number) =>
    ["rewrite-guide", journalEntryId, findingId ?? null] as const,
  home: () => ["home"] as const,
  profile: () => ["profile"] as const,
  welcome: () => ["welcome"] as const,
  garden: () => ["garden"] as const,
  stats: () => ["stats"] as const,
  jar: () => ["jar"] as const,
  messages: () => ["messages"] as const,
  history: (filters: { week?: number; dimension?: string; context?: string; pending?: boolean; rewritten?: boolean }) =>
    [
      "history",
      filters.week ?? null,
      filters.dimension ?? null,
      filters.context ?? null,
      filters.pending ?? false,
      filters.rewritten ?? false,
    ] as const,
  entryDetail: (journalEntryId: number) => ["entry-detail", journalEntryId] as const,
  adminCohorts: () => ["admin-cohorts"] as const,
  adminParticipants: (cohortId: number) => ["admin-participants", cohortId] as const,
  adminAdherence: (cohortId: number) => ["admin-adherence", cohortId] as const,
  adminAuditLogs: (filters: { from: string; to: string; action?: string; page: number }) =>
    ["admin-audit-logs", filters.from, filters.to, filters.action ?? null, filters.page] as const,
  adminConfig: () => ["admin-config"] as const,
};
