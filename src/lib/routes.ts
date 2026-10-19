/**
 * Rutas de pantalla del estudiante que llevan parámetros, en un solo lugar. El Espejo y la Reescritura son de un
 * registro, así que viven debajo de él: /historial/{id} → /historial/{id}/espejo → /historial/{id}/reescribir.
 */
export const routes = {
  /** CU-11: detalle de un registro. */
  entry: (journalEntryId: number) => `/historial/${journalEntryId}`,
  /** CU-03: el Espejo de un registro. */
  mirror: (journalEntryId: number) => `/historial/${journalEntryId}/espejo`,
  /** CU-04: reescribir un registro completo (todas sus frases duras en una sola reescritura). */
  rewrite: (journalEntryId: number) => `/historial/${journalEntryId}/reescribir`,
} as const;
