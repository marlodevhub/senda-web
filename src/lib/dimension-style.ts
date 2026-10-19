import type { Dimension } from "@/types/dimension";

/**
 * Cómo se ve cada dimensión de autoaceptación en toda la app (D1 Errores/Raíces, D2 Valoración/Flores, D3
 * Exigencia/Ritmo). Un solo lugar: el jardín, los gráficos, el Espejo, el historial y los filtros usan lo mismo.
 * Los colores (`--dim1..3` en globals.css) son por tema: lilas para Mujer y Otro, turquesas para Hombre.
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
  D1: "var(--dim1)",
  D2: "var(--dim2)",
  D3: "var(--dim3)",
};
