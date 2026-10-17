import { callBff } from "@/lib/api/client";
import type { JournalContext } from "@/types/journal-context";

/**
 * Lo que Inicio muestra de un registro al tocar su día en el calendario: sin textos, solo su ánimo, contexto y
 * cuántas frases tuvo, reescribió o le faltan. Sale del mismo listado del Historial (CU-11) filtrado por semana.
 */
export type HomeDayEntry = {
  id: number;
  date: string;
  interventionDay: number;
  moodBefore: 1 | 2 | 3 | 4 | 5;
  mode: "GUIDED" | "FREE";
  context: JournalContext | null;
  findingsCount: number;
  rewritesCount: number;
  pendingCount: number;
};

export async function getWeekEntries(week: number): Promise<HomeDayEntry[]> {
  const page = await callBff<{ items: HomeDayEntry[] }>(`/api/v1/journal-entries?week=${week}&page=1`);
  return page.items;
}
