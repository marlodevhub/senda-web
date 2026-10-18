/**
 * La senda: 28 días en 4 semanas (sección 12 del CLAUDE.md raíz). El día y la semana los calcula el servidor
 * (RS-TR); aquí solo se usan para mostrar el total ("Día 3 de 28") y acotar el día dentro de la senda.
 */
export const INTERVENTION_DAYS = 28;
export const INTERVENTION_WEEKS = 4;

/** El día dentro de 1…28 (antes del inicio, el 1; desde el día 29, el 28). */
export function clampJourneyDay(day: number): number {
  return Math.min(Math.max(day, 1), INTERVENTION_DAYS);
}

/** La semana (1…4) de un día de la senda que ya mandó el servidor, para pedir sus registros: techo(día / 7). */
export function weekOfDay(day: number): number {
  return Math.ceil(clampJourneyDay(day) / 7);
}

/**
 * Se puede escribir más de un registro por día: el número de cada uno dentro de su día (1, 2, …), en el orden en que
 * se escribieron (por id). Lo usan el Historial y el calendario de Inicio, para nombrarlos "Registro 1", "Registro 2".
 */
export function numberEntriesByDay(entries: { id: number; interventionDay: number }[]): Map<number, number> {
  const numbers = new Map<number, number>();
  const sorted = [...entries].sort((a, b) => a.interventionDay - b.interventionDay || a.id - b.id);
  let day: number | null = null;
  let count = 0;
  for (const entry of sorted) {
    count = entry.interventionDay === day ? count + 1 : 1;
    day = entry.interventionDay;
    numbers.set(entry.id, count);
  }
  return numbers;
}
