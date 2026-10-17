"use client";

import { useTranslations } from "next-intl";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AXIS_PROPS, CHART_ACCENT, GRID_PROPS, TOOLTIP_PROPS } from "@/features/progress/components/charts/chart-theme";
import type { MoodPoint } from "@/features/progress/api/get-stats";

/** `datos.animo`: por día, promedio del ánimo previo (RN-PR-06). */
export function MoodChart({ data }: { data: MoodPoint[] }) {
  const t = useTranslations();

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
        <CartesianGrid {...GRID_PROPS} />
        <XAxis dataKey="interventionDay" {...AXIS_PROPS} />
        <YAxis domain={[1, 5]} allowDecimals={false} {...AXIS_PROPS} />
        <Tooltip
          {...TOOLTIP_PROPS}
          cursor={{ stroke: "var(--border)" }}
          labelFormatter={(day) => t("progress.stats.dayLabel", { day: day as number })}
        />
        <Line
          type="monotone"
          dataKey="averageMood"
          stroke={CHART_ACCENT}
          strokeWidth={3}
          dot={{ r: 4, fill: "var(--card)", strokeWidth: 2 }}
          activeDot={{ r: 6, fill: CHART_ACCENT, stroke: "var(--card)", strokeWidth: 2 }}
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
