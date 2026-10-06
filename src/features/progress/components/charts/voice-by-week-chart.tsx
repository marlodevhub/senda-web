"use client";

import { useTranslations } from "next-intl";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { VoiceByWeekPoint } from "@/features/progress/api/get-stats";
import { DIMENSION_COLOR, DIMENSION_SHORT_KEY } from "@/features/progress/dimension-style";
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
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey="week"
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          tickLine={false}
          tickFormatter={(week) => t("progress.stats.weekLabel", { week })}
        />
        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
        <Tooltip contentStyle={{ borderRadius: 12, borderColor: "var(--border)", fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {DIMENSIONS.map((dimension) => (
          <Bar
            key={dimension}
            dataKey={dimension}
            name={t(DIMENSION_SHORT_KEY[dimension])}
            fill={DIMENSION_COLOR[dimension]}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
