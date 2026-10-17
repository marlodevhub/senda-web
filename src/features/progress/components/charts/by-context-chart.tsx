"use client";

import { useTranslations } from "next-intl";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AXIS_PROPS, CHART_ACCENT, GRID_PROPS, TOOLTIP_PROPS } from "@/features/progress/components/charts/chart-theme";
import type { ContextPoint } from "@/features/progress/api/get-stats";
import { JOURNAL_CONTEXT_LABEL_KEY } from "@/types/journal-context";

/** `datos.donde`: hallazgos visibles por contexto. */
export function ByContextChart({ data }: { data: ContextPoint[] }) {
  const t = useTranslations();
  const rows = data.map((point) => ({ ...point, label: t(JOURNAL_CONTEXT_LABEL_KEY[point.context]) }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={rows} layout="vertical" margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid {...GRID_PROPS} />
        <XAxis type="number" allowDecimals={false} {...AXIS_PROPS} />
        <YAxis type="category" dataKey="label" width={100} {...AXIS_PROPS} />
        <Tooltip {...TOOLTIP_PROPS} />
        <Bar dataKey="count" fill={CHART_ACCENT} radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
