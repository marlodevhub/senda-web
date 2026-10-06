"use client";

import { useTranslations } from "next-intl";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { TransformedWeek } from "@/features/progress/api/get-stats";

/** `datos.transformadas`: hallazgos visibles frente a reescritos, por semana. */
export function TransformedChart({ data }: { data: TransformedWeek[] }) {
  const t = useTranslations();

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
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
        <Bar
          dataKey="detected"
          name={t("progress.stats.transformedDetected")}
          fill="var(--chart-5)"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="rewritten"
          name={t("progress.stats.transformedRewritten")}
          fill="var(--sprout)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
