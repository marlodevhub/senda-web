import type { CSSProperties } from "react";

/**
 * Estilo común de los 6 gráficos de "Mis datos" (CU-08), con los colores de la paleta: siguen el tema (rosado con
 * Mujer u Otro, azul con Hombre) y el modo claro u oscuro. Nunca rojo para la autocrítica (sección 14 del CLAUDE.md).
 */

/** Serie principal (frases detectadas, ánimo, antes de reescribir): el acento del tema en pastel. */
export const CHART_ACCENT = "var(--chart-accent)";
/** Lo que creció (reescritas, después de reescribir, días con registro): el verde del jardín. */
export const CHART_GROWTH = "var(--sprout)";

export const GRID_PROPS = { strokeDasharray: "3 3", stroke: "var(--border)", vertical: false } as const;

export const AXIS_TICK = { fontSize: 13, fill: "var(--muted-foreground)" } as const;

export const AXIS_PROPS = { tick: AXIS_TICK, tickLine: false, axisLine: { stroke: "var(--border)" } } as const;

/** La franja al pasar el mouse sobre una columna: suave, del color del fondo hundido (no gris claro en modo oscuro). */
export const CURSOR = { fill: "var(--muted)", fillOpacity: 0.6, radius: 8 } as const;

const TOOLTIP_CONTENT: CSSProperties = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 14,
  boxShadow: "var(--shadow-card)",
  color: "var(--foreground)",
  fontSize: 14,
  padding: "8px 12px",
};

/** Tooltip con el fondo de las tarjetas y texto legible en los dos modos; el color de la serie va solo en el punto. */
export const TOOLTIP_PROPS = {
  contentStyle: TOOLTIP_CONTENT,
  labelStyle: { color: "var(--foreground)", fontWeight: 700, marginBottom: 4 },
  itemStyle: { color: "var(--foreground)", padding: 0 },
  cursor: CURSOR,
} as const;

/** Leyenda con texto en gris de la app (no del color de cada serie) y un punto redondo. */
export const LEGEND_PROPS = {
  iconType: "circle" as const,
  iconSize: 10,
  wrapperStyle: { fontSize: 14, paddingTop: 8 },
  formatter: (value: string) => <span style={{ color: "var(--muted-foreground)" }}>{value}</span>,
};

export const BAR_RADIUS: [number, number, number, number] = [6, 6, 0, 0];
