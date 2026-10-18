import { callBff } from "@/lib/api/client";
import type { Mood } from "@/components/icons/mood-orb";

/** `recordedAt`: la hora del toque (ISO 8601). */
export type CheckInResult = { mood: Mood; interventionDay: number; invitesToWrite: boolean; recordedAt: string };

/**
 * CU-06 (RS-IN-04): guarda una marca de ánimo con su hora; se puede marcar varias veces al día (RN-IN-03). Un toque
 * seguido del anterior (doble toque, cambio de opinión) lo reemplaza en el servidor, así que no hace falta clave de
 * idempotencia.
 */
export async function recordCheckIn(mood: Mood): Promise<CheckInResult> {
  return callBff<CheckInResult>("/api/v1/checkins", {
    method: "POST",
    body: JSON.stringify({ mood }),
  });
}
