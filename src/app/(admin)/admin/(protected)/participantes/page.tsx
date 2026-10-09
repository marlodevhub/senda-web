"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { CohortSelect } from "@/features/admin/components/cohort-select";
import { ParticipantTable } from "@/features/admin/components/participant-table";
import { useParticipants } from "@/features/admin/api/use-participants";

export default function AdminParticipantsPage() {
  const t = useTranslations();
  const [cohortId, setCohortId] = useState<number | null>(null);
  const { data: participants, isLoading } = useParticipants(cohortId ?? 0);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-xl font-semibold text-foreground">{t("admin.participants.title")}</h1>

      <div className="flex max-w-xs flex-col gap-1.5">
        <span className="text-sm font-medium text-foreground">{t("admin.participants.selectCohortLabel")}</span>
        <CohortSelect value={cohortId} onChange={setCohortId} placeholder={t("admin.participants.selectCohortPlaceholder")} />
      </div>

      {cohortId && (
        <Card>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
            ) : (
              <ParticipantTable participants={participants ?? []} />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
