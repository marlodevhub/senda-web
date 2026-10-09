"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BffError } from "@/lib/api/client";
import { adminErrorMessageKey } from "@/features/admin/api/error-messages";
import { useCloseCohort } from "@/features/admin/api/use-cohorts";
import type { Cohort } from "@/features/admin/api/cohorts";

const STATUS_KEY: Record<Cohort["status"], string> = {
  PLANNED: "admin.cohorts.statusPlanned",
  IN_PROGRESS: "admin.cohorts.statusInProgress",
  CLOSED: "admin.cohorts.statusClosed",
};

/** CU-24: listado de cohortes con sus conteos (nunca ids internos de participante). */
export function CohortTable({ cohorts }: { cohorts: Cohort[] }) {
  const t = useTranslations();
  const closeCohort = useCloseCohort();

  async function handleClose(cohortId: number) {
    try {
      await closeCohort.mutateAsync(cohortId);
      toast.success(t("admin.cohorts.closed"));
    } catch (error) {
      if (error instanceof BffError) {
        toast.error(t(adminErrorMessageKey(error.code)));
        return;
      }
      toast.error(t("common.unexpectedError"));
    }
  }

  if (cohorts.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("admin.cohorts.empty")}</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("admin.cohorts.nameLabel")}</TableHead>
          <TableHead>{t("admin.cohorts.startDateLabel")}</TableHead>
          <TableHead>{t("admin.cohorts.endDateLabel")}</TableHead>
          <TableHead>{t("admin.cohorts.statusColumn")}</TableHead>
          <TableHead>{t("admin.cohorts.pendingCount")}</TableHead>
          <TableHead>{t("admin.cohorts.activeCount")}</TableHead>
          <TableHead>{t("admin.cohorts.readOnlyCount")}</TableHead>
          <TableHead>{t("admin.cohorts.withdrawnCount")}</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {cohorts.map((cohort) => (
          <TableRow key={cohort.id}>
            <TableCell className="font-medium">{cohort.name}</TableCell>
            <TableCell>{cohort.startDate}</TableCell>
            <TableCell>{cohort.endDate}</TableCell>
            <TableCell>
              <Badge variant={cohort.status === "CLOSED" ? "secondary" : "default"}>
                {t(STATUS_KEY[cohort.status])}
              </Badge>
            </TableCell>
            <TableCell>{cohort.pendingCount}</TableCell>
            <TableCell>{cohort.activeCount}</TableCell>
            <TableCell>{cohort.readOnlyCount}</TableCell>
            <TableCell>{cohort.withdrawnCount}</TableCell>
            <TableCell className="flex gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href={`/admin/cohortes/${cohort.id}`}>{t("admin.cohorts.viewCta")}</Link>
              </Button>
              {cohort.status === "IN_PROGRESS" && (
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={closeCohort.isPending}
                  onClick={() => handleClose(cohort.id)}
                >
                  {t("admin.cohorts.closeCta")}
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
