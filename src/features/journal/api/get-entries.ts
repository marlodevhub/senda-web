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
};

export type HistoryPage = {
  items: JournalEntrySummary[];
  hasMore: boolean;
};

export type HistoryFilters = {
  week?: number;
  dimension?: string;
  context?: JournalContext;
  page?: number;
};

export async function getHistory(filters: HistoryFilters): Promise<HistoryPage> {
  const params = new URLSearchParams();
  if (filters.week) params.set("week", String(filters.week));
  if (filters.dimension) params.set("dimension", filters.dimension);
  if (filters.context) params.set("context", filters.context);
  params.set("page", String(filters.page ?? 1));

  return callBff<HistoryPage>(`/api/v1/journal-entries?${params.toString()}`);
}
