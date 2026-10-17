/**
 * Rutas de pantalla del estudiante que llevan parámetros, en un solo lugar. El Espejo y la Reescritura son de un
 * registro, así que viven debajo de él: /historial/{id} → /historial/{id}/espejo → /historial/{id}/reescribir.
 */
export const routes = {
  /** CU-11: detalle de un registro. */
  entry: (journalEntryId: number) => `/historial/${journalEntryId}`,
  /** CU-03: el Espejo de un registro. */
  mirror: (journalEntryId: number) => `/historial/${journalEntryId}/espejo`,
  /** CU-04: reescribir una frase de un registro; sin `findingId`, la que propone el servidor (RN-RE-01). */
  rewrite: (journalEntryId: number, findingId?: number) =>
    findingId === undefined
      ? `/historial/${journalEntryId}/reescribir`
      : `/historial/${journalEntryId}/reescribir?frase=${findingId}`,
} as const;

/** Lee el `?frase=` de la Reescritura: un id entero o nada. */
export function parseFindingId(frase: string | undefined): number | undefined {
  const id = frase === undefined ? Number.NaN : Number(frase);
  return Number.isInteger(id) ? id : undefined;
}
