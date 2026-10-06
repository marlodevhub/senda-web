"use client";

import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { useGarden } from "@/features/progress/api/use-garden";
import { GardenView } from "@/features/progress/components/garden-view";

export function GardenPageClient() {
  const t = useTranslations();
  const { data: garden, isPending, isError } = useGarden();

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

  return <GardenView garden={garden} />;
}
