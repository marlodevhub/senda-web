"use client";

import { useTranslations } from "next-intl";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { WeeklyAdherence } from "@/features/admin/api/adherence";

/** CU-25: adherencia por semana. Describe, no califica (regla 2 de coherencia). */
export function AdherenceTable({ weeks }: { weeks: WeeklyAdherence[] }) {
  const t = useTranslations();

  if (weeks.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("admin.adherence.empty")}</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("admin.adherence.weekColumn")}</TableHead>
          <TableHead>{t("admin.adherence.participantsWithEntryColumn")}</TableHead>
          <TableHead>{t("admin.adherence.percentMetGoalColumn")}</TableHead>
          <TableHead>{t("admin.adherence.entriesColumn")}</TableHead>
          <TableHead>{t("admin.adherence.rewritesColumn")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {weeks.map((week) => (
          <TableRow key={week.week}>
            <TableCell>{t("admin.adherence.weekLabel", { week: week.week })}</TableCell>
            <TableCell>{week.participantsWithEntry}</TableCell>
            <TableCell>{week.percentMetGoal}%</TableCell>
            <TableCell>{week.entries}</TableCell>
            <TableCell>{week.rewrites}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
