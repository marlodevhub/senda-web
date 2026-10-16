import { callBff } from "@/lib/api/client";
import type { JournalContext } from "@/features/journal/schemas/journal.schema";

export type JournalEntrySummary = {
  id: number;
  date: string;
  interventionDay: number;
  week: number;
  moodBefore: number;
  mode: "GUIDED" | "FREE";
  context: JournalContext | null;
  findingsCount: number;
  rewritesCount: number;
  /** Frases visibles que todavía no reescribió. */
  pendingCount: number;
};

export type HistoryPage = {
  items: JournalEntrySummary[];
  hasMore: boolean;
};

export type HistoryFilters = {
  week?: number;
  dimension?: string;
  context?: JournalContext;
  /** Solo los registros con frases por reescribir (pestaña "Por reescribir"). */
  pending?: boolean;
  page?: number;
};

export async function getHistory(filters: HistoryFilters): Promise<HistoryPage> {
  const params = new URLSearchParams();
  if (filters.week) params.set("week", String(filters.week));
  if (filters.dimension) params.set("dimension", filters.dimension);
  if (filters.context) params.set("context", filters.context);
  if (filters.pending) params.set("pending", "true");
  params.set("page", String(filters.page ?? 1));

  return callBff<HistoryPage>(`/api/v1/journal-entries?${params.toString()}`);
}
