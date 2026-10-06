"use client";

import { useTranslations } from "next-intl";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { BeforeAfterPoint } from "@/features/progress/api/get-stats";

/** `datos.antes_despues`: solo pares completos (RN-PR-06). */
export function BeforeAfterChart({ data }: { data: BeforeAfterPoint[] }) {
  const t = useTranslations();

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey="interventionDay"
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          tickLine={false}
          tickFormatter={(day) => t("progress.stats.dayLabel", { day })}
        />
        <YAxis domain={[1, 5]} allowDecimals={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
        <Tooltip contentStyle={{ borderRadius: 12, borderColor: "var(--border)", fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar
          dataKey="moodBefore"
          name={t("progress.stats.beforeAfterBefore")}
          fill="var(--chart-5)"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="moodAfter"
          name={t("progress.stats.beforeAfterAfter")}
          fill="var(--sprout)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
