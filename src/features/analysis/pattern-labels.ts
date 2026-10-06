/**
 * RN-ES-13: etiqueta amable fija por patrón. El backend solo manda el id
 * en inglés (p. ej. "self_disqualification"); el texto que ve el
 * estudiante vive en messages/es.json, como el resto de los textos de UI.
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
