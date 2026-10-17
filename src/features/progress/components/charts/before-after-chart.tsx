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
import type { BeforeAfterPoint } from "@/features/progress/api/get-stats";

/** `datos.antes_despues`: solo pares completos (RN-PR-06). */
export function BeforeAfterChart({ data }: { data: BeforeAfterPoint[] }) {
  const t = useTranslations();

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
        <CartesianGrid {...GRID_PROPS} />
        <XAxis
          dataKey="interventionDay"
          {...AXIS_PROPS}
          tickFormatter={(day) => t("progress.stats.dayLabel", { day })}
        />
        <YAxis domain={[1, 5]} allowDecimals={false} {...AXIS_PROPS} />
        <Tooltip {...TOOLTIP_PROPS} labelFormatter={(day) => t("progress.stats.dayLabel", { day: day as number })} />
        <Legend {...LEGEND_PROPS} />
        <Bar
          dataKey="moodBefore"
          name={t("progress.stats.beforeAfterBefore")}
          fill={CHART_ACCENT}
          radius={BAR_RADIUS}
        />
        <Bar dataKey="moodAfter" name={t("progress.stats.beforeAfterAfter")} fill={CHART_GROWTH} radius={BAR_RADIUS} />
      </BarChart>
    </ResponsiveContainer>
  );
}
