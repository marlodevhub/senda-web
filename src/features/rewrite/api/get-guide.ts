import { callBff } from "@/lib/api/client";
import type { Dimension } from "@/types/dimension";

export type Guide = {
  findingId: number;
  dimension: Dimension;
  pattern: string;
  originalPhrase: string;
  questions: string[];
  examples: string[];
};

export async function getGuide(journalEntryId: number, findingId?: number): Promise<Guide> {
  const query = findingId ? `?findingId=${findingId}` : "";
  return callBff<Guide>(`/api/v1/journal-entries/${journalEntryId}/rewrites/guide${query}`);
}
