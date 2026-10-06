import type { Dimension } from "@/types/dimension";

/** Mismo color fijo por dimensión que usa `GardenZone` (D1 raíces, D2 flores, D3 ritmo). */
export const DIMENSION_COLOR: Record<Dimension, string> = {
  D1: "var(--root)",
  D2: "var(--bloom)",
  D3: "var(--flow)",
};

export const DIMENSION_SHORT_KEY: Record<Dimension, string> = {
  D1: "progress.dimensionShort.d1",
  D2: "progress.dimensionShort.d2",
  D3: "progress.dimensionShort.d3",
};
