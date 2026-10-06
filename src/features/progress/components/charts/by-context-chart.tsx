"use client";

import { useTranslations } from "next-intl";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ContextPoint } from "@/features/progress/api/get-stats";
import { JOURNAL_CONTEXT_LABEL_KEY } from "@/types/journal-context";

/** `datos.donde`: hallazgos visibles por contexto. */
export function ByContextChart({ data }: { data: ContextPoint[] }) {
  const t = useTranslations();
  const rows = data.map((point) => ({ ...point, label: t(JOURNAL_CONTEXT_LABEL_KEY[point.context]) }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={rows} layout="vertical" margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
        <YAxis
          type="category"
          dataKey="label"
          width={100}
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          tickLine={false}
        />
        <Tooltip contentStyle={{ borderRadius: 12, borderColor: "var(--border)", fontSize: 12 }} />
        <Bar dataKey="count" fill="var(--chart-5)" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
