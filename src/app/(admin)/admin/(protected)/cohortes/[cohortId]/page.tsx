"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCohorts } from "@/features/admin/api/use-cohorts";
import { CodeBatchDialog } from "@/features/admin/components/code-batch-dialog";

export default function AdminCohortDetailPage() {
  const t = useTranslations();
  const params = useParams<{ cohortId: string }>();
  const cohortId = Number(params.cohortId);
  const { data: cohorts, isLoading } = useCohorts();
  const cohort = cohorts?.find((c) => c.id === cohortId);

  return (
    <div className="flex flex-col gap-6">
      <Button asChild variant="ghost" className="w-fit gap-1.5 px-1">
        <Link href="/admin/cohortes">
          <ArrowLeft className="size-4" />
          {t("admin.cohorts.back")}
        </Link>
      </Button>

      {!isLoading && cohort && (
        <Card>
          <CardHeader>
            <CardTitle>{cohort.name}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <div>
                <dt className="text-muted-foreground">{t("admin.cohorts.startDateLabel")}</dt>
                <dd>{cohort.startDate}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("admin.cohorts.endDateLabel")}</dt>
                <dd>{cohort.endDate}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("admin.cohorts.pendingCount")}</dt>
                <dd>{cohort.pendingCount}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("admin.cohorts.activeCount")}</dt>
                <dd>{cohort.activeCount}</dd>
              </div>
            </dl>
            <CodeBatchDialog cohortId={cohort.id} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
