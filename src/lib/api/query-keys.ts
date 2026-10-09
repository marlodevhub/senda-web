/** Claves de TanStack Query centralizadas (senda-web/CLAUDE.md sección 5). */
export const queryKeys = {
  mirror: (journalEntryId: number) => ["mirror", journalEntryId] as const,
  rewriteGuide: (journalEntryId: number, findingId?: number) =>
    ["rewrite-guide", journalEntryId, findingId ?? null] as const,
  garden: () => ["garden"] as const,
  stats: () => ["stats"] as const,
  messages: () => ["messages"] as const,
  history: (filters: { week?: number; dimension?: string; context?: string }) =>
    ["history", filters.week ?? null, filters.dimension ?? null, filters.context ?? null] as const,
  entryDetail: (journalEntryId: number) => ["entry-detail", journalEntryId] as const,
  adminCohorts: () => ["admin-cohorts"] as const,
  adminParticipants: (cohortId: number) => ["admin-participants", cohortId] as const,
  adminAdherence: (cohortId: number) => ["admin-adherence", cohortId] as const,
};
