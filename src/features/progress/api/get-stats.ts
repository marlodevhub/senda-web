import { callBff } from "@/lib/api/client";
import type { Dimension } from "@/types/dimension";
import type { JournalContext } from "@/types/journal-context";

export type MoodPoint = { interventionDay: number; averageMood: number };
export type BeforeAfterPoint = { interventionDay: number; moodBefore: number; moodAfter: number };
export type TransformedWeek = { week: number; detected: number; rewritten: number };
export type VoiceByWeekPoint = { week: number; dimension: Dimension; count: number };
export type ContextPoint = { context: JournalContext; count: number };
export type ConsistencyWeek = { week: number; daysWithEntry: number; goal: number };

export type Stats = {
  hasEnoughData: boolean;
  mood: MoodPoint[];
  beforeAfter: BeforeAfterPoint[];
  transformed: TransformedWeek[];
  voiceByWeek: VoiceByWeekPoint[];
  byContext: ContextPoint[];
  consistency: ConsistencyWeek[];
};

export async function getStats(): Promise<Stats> {
  return callBff<Stats>("/api/v1/progress/stats");
}
