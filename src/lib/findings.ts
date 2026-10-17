/** El campo del registro donde está una frase detectada (RS-ES-06). */
export type FindingField = "Q1" | "Q2" | "Q3" | "FREE_TEXT";

/** Los textos de un registro por campo; los que no tiene, vacíos o ausentes. */
export type FieldTexts = Partial<Record<FindingField, string | null>>;

/**
 * El fragmento exacto de una frase detectada: el backend solo manda el campo y las posiciones (RS-ES-06), así que se
 * recorta del texto del registro. Lo usan el Espejo (CU-03) y el detalle del historial (CU-11).
 */
export function sliceFinding(
  finding: { field: FindingField; start: number; end: number },
  texts: FieldTexts,
): string {
  return (texts[finding.field] ?? "").slice(finding.start, finding.end);
}
