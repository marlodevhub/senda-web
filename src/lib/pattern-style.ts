/**
 * Cómo se ve cada tipo de frase (RN-ES-13) en toda la app: una "escena" de clima por patrón, con su degradado, el
 * color de su texto y su resaltador (variables `--scene-*` en globals.css, iguales en todos los temas). Los 3 tipos de
 * cada dimensión van en tonos de la misma familia: cálidos para Errores (D1), azules y lilas para Valoración (D2),
 * verdes y grises para Exigencia (D3). Nunca rojo para la autocrítica.
 */
export type Scene = "night" | "sunny" | "rain" | "thunder" | "snow" | "sunset" | "haze" | "cloudy" | "aurora";

const PATTERN_SCENE: Record<string, Scene> = {
  self_disqualification: "sunset",
  error_overgeneralization: "sunny",
  self_punishment: "haze",
  worth_by_performance: "night",
  social_comparison: "thunder",
  need_for_approval: "snow",
  should_and_perfectionism: "rain",
  guilt_for_resting: "aurora",
  all_or_nothing: "cloudy",
};

/** La escena de un tipo de frase; uno desconocido va en gris. */
export function sceneOf(pattern: string): Scene {
  return PATTERN_SCENE[pattern] ?? "cloudy";
}

/** Fondo de la tarjeta (degradado) y color de su texto. */
export const SCENE_CARD: Record<Scene, string> = {
  night: "bg-linear-to-br from-(--scene-night-from) to-(--scene-night-to) text-(--scene-night-ink)",
  sunny: "bg-linear-to-br from-(--scene-sunny-from) to-(--scene-sunny-to) text-(--scene-sunny-ink)",
  rain: "bg-linear-to-br from-(--scene-rain-from) to-(--scene-rain-to) text-(--scene-rain-ink)",
  thunder: "bg-linear-to-br from-(--scene-thunder-from) to-(--scene-thunder-to) text-(--scene-thunder-ink)",
  snow: "bg-linear-to-br from-(--scene-snow-from) to-(--scene-snow-to) text-(--scene-snow-ink)",
  sunset: "bg-linear-to-br from-(--scene-sunset-from) to-(--scene-sunset-to) text-(--scene-sunset-ink)",
  haze: "bg-linear-to-br from-(--scene-haze-from) to-(--scene-haze-to) text-(--scene-haze-ink)",
  cloudy: "bg-linear-to-br from-(--scene-cloudy-from) to-(--scene-cloudy-to) text-(--scene-cloudy-ink)",
  aurora: "bg-linear-to-br from-(--scene-aurora-from) to-(--scene-aurora-to) text-(--scene-aurora-ink)",
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
  aurora: "bg-(--scene-aurora-mark) text-foreground",
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
  aurora: "bg-(--scene-aurora-from)",
};

export function patternMark(pattern: string): string {
  return SCENE_MARK[sceneOf(pattern)];
}

export function patternDot(pattern: string): string {
  return SCENE_DOT[sceneOf(pattern)];
}
