import { callBff } from "@/lib/api/client";
import type { Dimension } from "@/types/dimension";

export type MirrorStatus = "COMPLETED" | "RISK" | "PENDING" | "FAILED";
export type ConfirmationAnswer = "YES" | "PARTLY" | "NO";
export type AnalysisField = "Q1" | "Q2" | "Q3" | "FREE_TEXT";
export type Intensity = "LOW" | "MODERATE" | "HIGH";

export type MirrorFinding = {
  findingId: number;
  dimension: Dimension;
  pattern: string;
  field: AnalysisField;
  start: number;
  end: number;
  confidence: number;
};

export type Mirror = {
  status: MirrorStatus;
  findings: MirrorFinding[] | null;
  predominantDimension: Dimension | null;
  intensity: Intensity | null;
  confirmation: ConfirmationAnswer | null;
};

export async function getMirror(journalEntryId: number): Promise<Mirror> {
  return callBff<Mirror>(`/api/v1/journal-entries/${journalEntryId}/mirror`);
}
