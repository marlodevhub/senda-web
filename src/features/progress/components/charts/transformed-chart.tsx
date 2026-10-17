"use client";

import { useTranslations } from "next-intl";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  AXIS_PROPS,
  BAR_RADIUS,
  CHART_ACCENT,
  CHART_GROWTH,
  GRID_PROPS,
  LEGEND_PROPS,
  TOOLTIP_PROPS,
} from "@/features/progress/components/charts/chart-theme";
import type { TransformedWeek } from "@/features/progress/api/get-stats";

/** `datos.transformadas`: hallazgos visibles frente a reescritos, por semana. */
export function TransformedChart({ data }: { data: TransformedWeek[] }) {
  const t = useTranslations();

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
        <CartesianGrid {...GRID_PROPS} />
        <XAxis dataKey="week" {...AXIS_PROPS} tickFormatter={(week) => t("progress.stats.weekLabel", { week })} />
        <YAxis allowDecimals={false} {...AXIS_PROPS} />
        <Tooltip
          {...TOOLTIP_PROPS}
          labelFormatter={(week) => t("progress.stats.weekLabel", { week: week as number })}
        />
        <Legend {...LEGEND_PROPS} />
        <Bar
          dataKey="detected"
          name={t("progress.stats.transformedDetected")}
          fill={CHART_ACCENT}
          radius={BAR_RADIUS}
        />
        <Bar
          dataKey="rewritten"
          name={t("progress.stats.transformedRewritten")}
          fill={CHART_GROWTH}
          radius={BAR_RADIUS}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
