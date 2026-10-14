"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useCurrentConfig } from "@/features/admin/api/use-audit";
import { formatDateTime } from "@/lib/format/dates";

/** CU-27 paso 3: lo que corre ahora y la etiqueta congelada de cada cohorte (HU-27.1). */
export function ConfigStatusCard() {
  const t = useTranslations();
  const { data: config, isPending, isError } = useCurrentConfig();

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <h2 className="font-heading text-lg font-semibold text-foreground">{t("admin.audit.configTitle")}</h2>

        {isPending && <p className="text-sm text-muted-foreground">{t("common.loading")}</p>}
        {isError && <p className="text-sm text-destructive">{t("common.unexpectedError")}</p>}

        {config && (
          <>
            <dl className="grid grid-cols-2 gap-3 text-sm md:grid-cols-5">
              <div>
                <dt className="text-muted-foreground">{t("admin.audit.fingerprint")}</dt>
                <dd className="font-mono">{config.fingerprint}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("admin.audit.promptVersion")}</dt>
                <dd>{config.promptVersion}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("admin.audit.lexiconVersion")}</dt>
                <dd>{config.lexiconVersion}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("admin.audit.provider")}</dt>
                <dd>{config.provider}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("admin.audit.model")}</dt>
                <dd>{config.model}</dd>
              </div>
            </dl>

            {config.cohorts.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("admin.audit.noFrozenCohorts")}</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {config.cohorts.map((cohort) => (
                  <li
                    key={cohort.cohortId}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border p-3 text-sm"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-foreground">{cohort.cohortName}</span>
                      <span className="font-mono text-xs text-muted-foreground">{cohort.configVersion}</span>
                      {cohort.frozenAt && (
                        <span className="text-xs text-muted-foreground">
                          {t("admin.audit.frozenAt", { date: formatDateTime(cohort.frozenAt) })}
                        </span>
                      )}
                    </div>
                    <Badge variant={cohort.matchesRunning ? "secondary" : "destructive"}>
                      {cohort.matchesRunning ? t("admin.audit.matchesRunning") : t("admin.audit.differsFromRunning")}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
