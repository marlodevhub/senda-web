/**
 * Cómo se ve cada tipo de frase (RN-ES-13) en toda la app: una "escena" de clima calcada de las tarjetas de
 * referencia (variables `--scene-*` en globals.css, iguales en todos los temas). Hay 8 escenas para 9 tipos: la
 * tormenta la comparten "Compararte" (D2) y "Todo o nada" (D3). Nunca rojo para la autocrítica.
 */
export type Scene = "night" | "sunny" | "rain" | "thunder" | "snow" | "sunset" | "haze" | "cloudy";

const PATTERN_SCENE: Record<string, Scene> = {
  self_disqualification: "sunset",
  error_overgeneralization: "cloudy",
  self_punishment: "haze",
  worth_by_performance: "sunny",
  social_comparison: "thunder",
  need_for_approval: "snow",
  should_and_perfectionism: "rain",
  guilt_for_resting: "night",
  all_or_nothing: "thunder",
};

/** La escena de un tipo de frase; uno desconocido va nublado. */
export function sceneOf(pattern: string): Scene {
  return PATTERN_SCENE[pattern] ?? "cloudy";
}

/** Color de "Ver" (texto grande sobre la parte de abajo de la tarjeta). */
export const SCENE_ACTION_TEXT: Record<Scene, string> = {
  night: "text-(--scene-night-action)",
  sunny: "text-(--scene-sunny-action)",
  rain: "text-(--scene-rain-action)",
  thunder: "text-(--scene-thunder-action)",
  snow: "text-(--scene-snow-action)",
  sunset: "text-(--scene-sunset-action)",
  haze: "text-(--scene-haze-action)",
  cloudy: "text-(--scene-cloudy-action)",
};

/** La flechita: el fondo del color de "Ver" y el ícono del color de la tarjeta. */
export const SCENE_ARROW: Record<Scene, string> = {
  night: "bg-(--scene-night-action) text-(--scene-night-on-action)",
  sunny: "bg-(--scene-sunny-action) text-(--scene-sunny-on-action)",
  rain: "bg-(--scene-rain-action) text-(--scene-rain-on-action)",
  thunder: "bg-(--scene-thunder-action) text-(--scene-thunder-on-action)",
  snow: "bg-(--scene-snow-action) text-(--scene-snow-on-action)",
  sunset: "bg-(--scene-sunset-action) text-(--scene-sunset-on-action)",
  haze: "bg-(--scene-haze-action) text-(--scene-haze-on-action)",
  cloudy: "bg-(--scene-cloudy-action) text-(--scene-cloudy-on-action)",
};

/** Resaltador de la frase dentro del texto, con el color de texto normal. */
const SCENE_MARK: Record<Scene, string> = {
  night: "bg-(--scene-night-mark) text-foreground",
  sunny: "bg-(--scene-sunny-mark) text-foreground",
  rain: "bg-(--scene-rain-mark) text-foreground",
  thunder: "bg-(--scene-thunder-mark) text-foreground",
  snow: "bg-(--scene-snow-mark) text-foreground",
  sunset: "bg-(--scene-sunset-mark) text-foreground",
  haze: "bg-(--scene-haze-mark) text-foreground",
  cloudy: "bg-(--scene-cloudy-mark) text-foreground",
};

/** Punto de color junto al tipo de frase. */
const SCENE_DOT: Record<Scene, string> = {
  night: "bg-(--scene-night-from)",
  sunny: "bg-(--scene-sunny-from)",
  rain: "bg-(--scene-rain-from)",
  thunder: "bg-(--scene-thunder-from)",
  snow: "bg-(--scene-snow-from)",
  sunset: "bg-(--scene-sunset-from)",
  haze: "bg-(--scene-haze-from)",
  cloudy: "bg-(--scene-cloudy-from)",
};

export function patternMark(pattern: string): string {
  return SCENE_MARK[sceneOf(pattern)];
}

export function patternDot(pattern: string): string {
  return SCENE_DOT[sceneOf(pattern)];
}
