"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCohorts } from "@/features/admin/api/use-cohorts";
import { CohortForm } from "@/features/admin/components/cohort-form";
import { CohortTable } from "@/features/admin/components/cohort-table";

export default function AdminCohortsPage() {
  const t = useTranslations();
  const { data: cohorts, isLoading } = useCohorts();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-xl font-semibold text-foreground">{t("admin.cohorts.title")}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{t("admin.cohorts.createTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <CohortForm />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          {isLoading ? <p className="text-sm text-muted-foreground">{t("common.loading")}</p> : <CohortTable cohorts={cohorts ?? []} />}
        </CardContent>
      </Card>
    </div>
  );
}
