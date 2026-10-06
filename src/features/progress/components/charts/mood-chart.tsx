"use client";

import { useTranslations } from "next-intl";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { MoodPoint } from "@/features/progress/api/get-stats";

/** `datos.animo`: por día, promedio del ánimo previo (RN-PR-06). */
export function MoodChart({ data }: { data: MoodPoint[] }) {
  const t = useTranslations();

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey="interventionDay"
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          tickLine={false}
        />
        <YAxis domain={[1, 5]} allowDecimals={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
        <Tooltip
          contentStyle={{ borderRadius: 12, borderColor: "var(--border)", fontSize: 12 }}
          labelFormatter={(day) => t("progress.stats.dayLabel", { day: day as number })}
        />
        <Line
          type="monotone"
          dataKey="averageMood"
          stroke="var(--chart-5)"
          strokeWidth={2}
          dot={{ r: 3 }}
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
