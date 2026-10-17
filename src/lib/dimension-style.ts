import type { Dimension } from "@/types/dimension";

/**
 * Cómo se ve cada dimensión de autoaceptación en toda la app (D1 Errores/Raíces, D2 Valoración/Flores, D3
 * Exigencia/Ritmo). Un solo lugar: el jardín, los gráficos, el Espejo, el historial y los filtros usan lo mismo.
 */
export const DIMENSIONS = ["D1", "D2", "D3"] as const satisfies readonly Dimension[];

/** Nombre corto ("Errores", "Valoración", "Exigencia"). */
export const DIMENSION_SHORT_KEY: Record<Dimension, string> = {
  D1: "progress.dimensionShort.d1",
  D2: "progress.dimensionShort.d2",
  D3: "progress.dimensionShort.d3",
};

/** Color de la serie en gráficos y del frasco (variable CSS). */
export const DIMENSION_COLOR: Record<Dimension, string> = {
  D1: "var(--root)",
  D2: "var(--bloom)",
  D3: "var(--flow)",
};

/** Punto de color junto al tipo de frase. */
export const DIMENSION_DOT: Record<Dimension, string> = {
  D1: "bg-root",
  D2: "bg-bloom",
  D3: "bg-flow",
};

/** Fondo suave con texto legible (resaltado de una frase dentro del texto). */
export const DIMENSION_TINT: Record<Dimension, string> = {
  D1: "bg-root-tint text-root-ink",
  D2: "bg-bloom-tint text-bloom-ink",
  D3: "bg-flow-tint text-flow-ink",
};
