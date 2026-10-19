/**
 * Cómo se ve cada tipo de frase (RN-ES-13) en toda la app: una "escena" de clima en el estilo de las tarjetas de
 * referencia, todas vivas (variables `--scene-*` en globals.css, iguales en todos los temas). Hay 8 escenas para 9
 * tipos: la tormenta la comparten "Compararte" (D2) y "Todo o nada" (D3). Nunca rojo para la autocrítica.
 */
export type Scene = "night" | "sunny" | "rain" | "thunder" | "snow" | "sunset" | "dawn" | "lagoon";

const PATTERN_SCENE: Record<string, Scene> = {
  self_disqualification: "sunset",
  error_overgeneralization: "lagoon",
  self_punishment: "dawn",
  worth_by_performance: "sunny",
  social_comparison: "thunder",
  need_for_approval: "snow",
  should_and_perfectionism: "rain",
  guilt_for_resting: "night",
  all_or_nothing: "thunder",
};

/** La escena de un tipo de frase; uno desconocido va en la laguna. */
export function sceneOf(pattern: string): Scene {
  return PATTERN_SCENE[pattern] ?? "lagoon";
}

/** Las letras de la tarjeta (título y "Ver"), en pastel. */
export const SCENE_INK: Record<Scene, string> = {
  night: "text-(--scene-night-ink)",
  sunny: "text-(--scene-sunny-ink)",
  rain: "text-(--scene-rain-ink)",
  thunder: "text-(--scene-thunder-ink)",
  snow: "text-(--scene-snow-ink)",
  sunset: "text-(--scene-sunset-ink)",
  dawn: "text-(--scene-dawn-ink)",
  lagoon: "text-(--scene-lagoon-ink)",
};

/** Resaltador de la frase dentro del texto, con el color de texto normal. */
const SCENE_MARK: Record<Scene, string> = {
  night: "bg-(--scene-night-mark) text-foreground",
  sunny: "bg-(--scene-sunny-mark) text-foreground",
  rain: "bg-(--scene-rain-mark) text-foreground",
  thunder: "bg-(--scene-thunder-mark) text-foreground",
  snow: "bg-(--scene-snow-mark) text-foreground",
  sunset: "bg-(--scene-sunset-mark) text-foreground",
  dawn: "bg-(--scene-dawn-mark) text-foreground",
  lagoon: "bg-(--scene-lagoon-mark) text-foreground",
};

/** Punto de color junto al tipo de frase. */
const SCENE_DOT: Record<Scene, string> = {
  night: "bg-(--scene-night-from)",
  sunny: "bg-(--scene-sunny-from)",
  rain: "bg-(--scene-rain-from)",
  thunder: "bg-(--scene-thunder-from)",
  snow: "bg-(--scene-snow-from)",
  sunset: "bg-(--scene-sunset-from)",
  dawn: "bg-(--scene-dawn-from)",
  lagoon: "bg-(--scene-lagoon-from)",
};

export function patternMark(pattern: string): string {
  return SCENE_MARK[sceneOf(pattern)];
}

export function patternDot(pattern: string): string {
  return SCENE_DOT[sceneOf(pattern)];
}
