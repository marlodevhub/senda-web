"use client";

import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { useJar } from "@/features/progress/api/use-jar";
import { JarView } from "@/features/progress/components/jar-view";

/** CU-09: carga del frasco; también disponible en SOLO_LECTURA. */
export function JarPageClient() {
  const t = useTranslations();
  const { data: cards, isPending, isError } = useJar();

  if (isPending) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="size-6 animate-spin text-muted-foreground" aria-label={t("common.loading")} />
      </div>
    );
  }
  if (isError || !cards) {
    return <p className="py-10 text-center text-sm text-muted-foreground">{t("common.unexpectedError")}</p>;
  }
  return <JarView cards={cards} />;
}
