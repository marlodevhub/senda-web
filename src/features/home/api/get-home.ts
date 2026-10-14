import { callBff } from "@/lib/api/client";
import type { Dimension } from "@/types/dimension";

export type HomeParticipantStatus = "PENDING" | "ACTIVE" | "READ_ONLY" | "WITHDRAWN";

export type HomePendingPhrase = {
  findingId: number;
  journalEntryId: number;
  dimension: Dimension;
  pattern: string;
  fragment: string;
};

export type HomeGoal = { daysWithEntry: number; goal: number };

/** RS-IN-01: la respuesta única de CU-05. */
export type Home = {
  day: number;
  status: HomeParticipantStatus;
  checkinToday: boolean;
  /** CU-06: la cara marcada hoy (1..5), o null si todavía no marcó. */
  checkinMood: 1 | 2 | 3 | 4 | 5 | null;
  pendingPhrase: HomePendingPhrase | null;
  goal: HomeGoal | null;
  newMessages: boolean;
  newSummary: boolean;
  posttestUrl: string | null;
};

export async function getHome(): Promise<Home> {
  return callBff<Home>("/api/v1/home");
}
