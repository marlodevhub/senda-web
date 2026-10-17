"use client";

import { useTranslations } from "next-intl";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  AXIS_PROPS,
  BAR_RADIUS,
  GRID_PROPS,
  LEGEND_PROPS,
  TOOLTIP_PROPS,
} from "@/features/progress/components/charts/chart-theme";
import type { VoiceByWeekPoint } from "@/features/progress/api/get-stats";
import { DIMENSION_COLOR, DIMENSION_SHORT_KEY } from "@/lib/dimension-style";
import type { Dimension } from "@/types/dimension";

const DIMENSIONS: Dimension[] = ["D1", "D2", "D3"];

type WeekRow = { week: number } & Record<Dimension, number>;

function pivotByWeek(points: VoiceByWeekPoint[]): WeekRow[] {
  const byWeek = new Map<number, WeekRow>();
  for (const point of points) {
    const row = byWeek.get(point.week) ?? { week: point.week, D1: 0, D2: 0, D3: 0 };
    row[point.dimension] = point.count;
    byWeek.set(point.week, row);
  }
  return [...byWeek.values()].sort((a, b) => a.week - b.week);
}

/** `datos.voz_interna`: hallazgos visibles por dimensión y semana. */
export function VoiceByWeekChart({ data }: { data: VoiceByWeekPoint[] }) {
  const t = useTranslations();
  const rows = pivotByWeek(data);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={rows} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
        <CartesianGrid {...GRID_PROPS} />
        <XAxis dataKey="week" {...AXIS_PROPS} tickFormatter={(week) => t("progress.stats.weekLabel", { week })} />
        <YAxis allowDecimals={false} {...AXIS_PROPS} />
        <Tooltip
          {...TOOLTIP_PROPS}
          labelFormatter={(week) => t("progress.stats.weekLabel", { week: week as number })}
        />
        <Legend {...LEGEND_PROPS} />
        {DIMENSIONS.map((dimension) => (
          <Bar
            key={dimension}
            dataKey={dimension}
            name={t(DIMENSION_SHORT_KEY[dimension])}
            fill={DIMENSION_COLOR[dimension]}
            radius={BAR_RADIUS}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
