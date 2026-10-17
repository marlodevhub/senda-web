"use client";

import { useTranslations } from "next-intl";
import { Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  AXIS_PROPS,
  BAR_RADIUS,
  CHART_GROWTH,
  GRID_PROPS,
  TOOLTIP_PROPS,
} from "@/features/progress/components/charts/chart-theme";
import type { ConsistencyWeek } from "@/features/progress/api/get-stats";

/** `datos.constancia`: días con registro por semana frente a la meta de 3 (RN-PR-06). */
export function ConsistencyChart({ data }: { data: ConsistencyWeek[] }) {
  const t = useTranslations();
  const goal = data[0]?.goal ?? 0;

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
        <ReferenceLine
          y={goal}
          stroke="var(--muted-foreground)"
          strokeDasharray="4 4"
          label={{
            value: t("progress.stats.consistencyGoal"),
            position: "insideTopRight",
            fontSize: 13,
            fill: "var(--muted-foreground)",
          }}
        />
        <Bar dataKey="daysWithEntry" fill={CHART_GROWTH} radius={BAR_RADIUS} />
      </BarChart>
    </ResponsiveContainer>
  );
}
