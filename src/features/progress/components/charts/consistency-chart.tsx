"use client";

import { useTranslations } from "next-intl";
import { Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ConsistencyWeek } from "@/features/progress/api/get-stats";

/** `datos.constancia`: días con registro por semana frente a la meta de 3 (RN-PR-06). */
export function ConsistencyChart({ data }: { data: ConsistencyWeek[] }) {
  const t = useTranslations();
  const goal = data[0]?.goal ?? 0;

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
        <ReferenceLine
          y={goal}
          stroke="var(--flow)"
          strokeDasharray="4 4"
          label={{ value: t("progress.stats.consistencyGoal"), position: "insideTopRight", fontSize: 11, fill: "var(--flow-ink)" }}
        />
        <Bar dataKey="daysWithEntry" fill="var(--sprout)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
