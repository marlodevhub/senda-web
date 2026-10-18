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

/** CU-05: el registro de hoy, para "Tu espejo de hoy". */
export type HomeTodayEntry = {
  journalEntryId: number;
  analysisStatus: "PENDING" | "COMPLETED" | "FAILED" | "RISK";
  findingsCount: number;
};

/** CU-05: un día de la semana actual (fecha AAAA-MM-DD en Lima); `mood` es el check-in o el ánimo del registro. */
export type HomeWeekDay = {
  interventionDay: number;
  date: string;
  hasEntry: boolean;
  mood: 1 | 2 | 3 | 4 | 5 | null;
};

/** RS-IN-01: la respuesta única de CU-05. */
export type Home = {
  day: number;
  status: HomeParticipantStatus;
  checkinToday: boolean;
  /** CU-06: la cara marcada hoy (1..5), o null si todavía no marcó. */
  checkinMood: 1 | 2 | 3 | 4 | 5 | null;
  pendingPhrase: HomePendingPhrase | null;
  /** null si hoy todavía no escribió (o en SOLO_LECTURA). */
  todayEntry: HomeTodayEntry | null;
  /** Escritorio: todas las frases por reescribir, de la más reciente (vacía en SOLO_LECTURA). */
  pendingPhrases: HomePendingPhrase[];
  goal: HomeGoal | null;
  newMessages: boolean;
  newSummary: boolean;
  posttestUrl: string | null;
  /** Semana actual (1..4) y sus 7 días, para el calendario. */
  week: number;
  weekDays: HomeWeekDay[];
  /** Los 28 días de la senda, para el calendario por mes (escritorio). */
  journeyDays: HomeWeekDay[];
  /** Cómo quiere que lo llamen ("Hola, Mario, ¿cómo estás hoy?"), o null si todavía no lo dio. */
  preferredName: string | null;
};

export async function getHome(): Promise<Home> {
  return callBff<Home>("/api/v1/home");
}
