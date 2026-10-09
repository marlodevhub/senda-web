"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CohortSelect } from "@/features/admin/components/cohort-select";
import { AdherenceTable } from "@/features/admin/components/adherence-table";
import { useAdherence } from "@/features/admin/api/use-adherence";
import { exportUrl } from "@/features/admin/api/adherence";

export default function AdminAdherencePage() {
  const t = useTranslations();
  const [cohortId, setCohortId] = useState<number | null>(null);
  const { data: adherence, isLoading } = useAdherence(cohortId ?? 0);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-xl font-semibold text-foreground">{t("admin.adherence.title")}</h1>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex max-w-xs flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground">{t("admin.adherence.selectCohortLabel")}</span>
          <CohortSelect value={cohortId} onChange={setCohortId} placeholder={t("admin.adherence.selectCohortPlaceholder")} />
        </div>

        {cohortId && (
          <Button asChild variant="outline" className="gap-1.5">
            <a href={exportUrl(cohortId)}>
              <Download className="size-4" />
              {t("admin.adherence.exportCta")}
            </a>
          </Button>
        )}
      </div>

      {!cohortId && <p className="text-sm text-muted-foreground">{t("admin.adherence.noCohortSelected")}</p>}

      {cohortId && !isLoading && adherence && (
        <>
          <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-muted-foreground">{t("admin.adherence.pendingCount")}</dt>
              <dd>{adherence.pendingCount}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t("admin.adherence.activeCount")}</dt>
              <dd>{adherence.activeCount}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t("admin.adherence.readOnlyCount")}</dt>
              <dd>{adherence.readOnlyCount}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t("admin.adherence.withdrawnCount")}</dt>
              <dd>{adherence.withdrawnCount}</dd>
            </div>
          </dl>

          <Card>
            <CardContent>
              <AdherenceTable weeks={adherence.weeks} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
