import { callBff } from "@/lib/api/client";
import type { Dimension } from "@/types/dimension";
import type { JournalContext } from "@/features/journal/schemas/journal.schema";

export type EntryAnalysisStatus = "PENDING" | "COMPLETED" | "RISK" | "FAILED";
export type EntryAnalysisField = "Q1" | "Q2" | "Q3" | "FREE_TEXT";

export type EntryMirrorFinding = {
  findingId: number;
  dimension: Dimension;
  pattern: string;
  field: EntryAnalysisField;
  start: number;
  end: number;
  confidence: number;
};

export type EntryMirror = {
  findings: EntryMirrorFinding[];
  predominantDimension: Dimension | null;
  intensity: "LOW" | "MODERATE" | "HIGH" | null;
  confirmation: "YES" | "PARTLY" | "NO" | null;
};

/** Un intento de reescribir el registro completo (CU-04); `moodAfter` es la carita que le puso la IA. */
export type EntryRewrite = {
  id: number;
  dimension: Dimension | null;
  pattern: string | null;
  result: "SOFTENED" | "ALMOST" | "STILL_HARD" | "PENDING" | "RISK" | null;
  moodAfter: number | null;
  attemptNumber: number;
  inJar: boolean;
  /** El texto de este intento (solo en el detalle, para su dueño). */
  text: string;
};

export type JournalEntryDetail = {
  id: number;
  date: string;
  interventionDay: number;
  /** El número del registro dentro de su día (1, 2, …), igual que en el Historial y el calendario de Inicio. */
  numberInDay: number;
  mode: "GUIDED" | "FREE";
  moodBefore: number;
  q1: string | null;
  q2: string | null;
  q3: string | null;
  freeText: string | null;
  context: JournalContext | null;
  status: EntryAnalysisStatus;
  mirror: EntryMirror | null;
  rewrites: EntryRewrite[];
};

export async function getEntryDetail(journalEntryId: number): Promise<JournalEntryDetail> {
  return callBff<JournalEntryDetail>(`/api/v1/journal-entries/${journalEntryId}`);
}

export async function deleteEntry(journalEntryId: number): Promise<void> {
  await callBff<void>(`/api/v1/journal-entries/${journalEntryId}`, { method: "DELETE" });
}
