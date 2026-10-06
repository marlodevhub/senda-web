"use client";

import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { useStats } from "@/features/progress/api/use-stats";
import { StatsView } from "@/features/progress/components/stats-view";

export function StatsPageClient() {
  const t = useTranslations();
  const { data: stats, isPending, isError } = useStats();

  if (isPending) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden />
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
      </div>
    );
  }

  if (isError) {
    return <p className="py-10 text-center text-sm text-muted-foreground">{t("common.unexpectedError")}</p>;
  }

  return <StatsView stats={stats} />;
}
