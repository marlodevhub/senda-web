/**
 * RN-ES-13: etiqueta amable fija por patrón. El backend solo manda el id
 * en inglés (p. ej. "self_disqualification"); el texto que ve el
 * estudiante vive en messages/es.json, como el resto de los textos de UI.
 * Compartido porque lo usan `analysis` (Espejo en vivo) y `journal`
 * (detalle del historial, CU-11).
 */
const PATTERN_KEY: Record<string, string> = {
  self_disqualification: "selfDisqualification",
  error_overgeneralization: "errorOvergeneralization",
  self_punishment: "selfPunishment",
  worth_by_performance: "worthByPerformance",
  social_comparison: "socialComparison",
  need_for_approval: "needForApproval",
  should_and_perfectionism: "shouldAndPerfectionism",
  guilt_for_resting: "guiltForResting",
  all_or_nothing: "allOrNothing",
};

export function patternLabelKey(pattern: string): string {
  return `analysis.patterns.${PATTERN_KEY[pattern] ?? "generic"}`;
}

/** Nombre corto y amable del tipo de frase, para el título de su tarjeta ("Etiqueta dura", "Todo o nada"). */
export function patternTitleKey(pattern: string): string {
  return `analysis.patternTitles.${PATTERN_KEY[pattern] ?? "generic"}`;
}

/**
 * RN-ES-13: el mensaje del Espejo según el tipo de frase (la de mayor confianza de la dimensión predominante) y la
 * intensidad de esa dimensión, del catálogo congelado (nunca generado). Null si el patrón no está en el catálogo: se usa
 * el mensaje general de la dimensión.
 */
export function patternMessageKey(pattern: string, intensity: "low" | "moderate" | "high"): string | null {
  const key = PATTERN_KEY[pattern];
  return key ? `analysis.patternMessages.${key}.${intensity}` : null;
}
