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

/** Punto de color junto al tipo de frase. */
export const DIMENSION_DOT: Record<Dimension, string> = {
  D1: "bg-dim1",
  D2: "bg-dim2",
  D3: "bg-dim3",
};

/**
 * Fondo de la tarjeta de una frase detectada (Espejo, detalle del registro, Inicio, Reescritura): el tono suave de su
 * dimensión, para distinguir de un vistazo Errores, Valoración y Exigencia. Los registros van en el color del tema.
 */
export const DIMENSION_CARD: Record<Dimension, string> = {
  D1: "bg-dim1-tint",
  D2: "bg-dim2-tint",
  D3: "bg-dim3-tint",
};

/** Resaltador: la frase dentro del texto, con el color saturado de su dimensión (como un marcador). */
export const DIMENSION_TINT: Record<Dimension, string> = {
  D1: "bg-dim1-mark text-foreground",
  D2: "bg-dim2-mark text-foreground",
  D3: "bg-dim3-mark text-foreground",
};
