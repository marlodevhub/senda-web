import { callBff } from "@/lib/api/client";
import type { Mood } from "@/components/icons/mood-orb";

export type CheckInResult = { mood: Mood; interventionDay: number; invitesToWrite: boolean };

/** CU-06 (RS-IN-04): crea o reemplaza el check-in de hoy; PUT es idempotente. */
export async function recordCheckIn(mood: Mood): Promise<CheckInResult> {
  return callBff<CheckInResult>("/api/v1/checkins/today", {
    method: "PUT",
    body: JSON.stringify({ mood }),
  });
}
