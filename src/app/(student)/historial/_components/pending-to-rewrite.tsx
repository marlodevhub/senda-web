"use client";

import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { useHome } from "@/features/home/api/use-home";
import { NoPendingPhrase, PendingPhraseList } from "@/features/home/components/pending-phrase-card";

/** Historial › Por reescribir: las frases que faltan reescribir (las mismas de Inicio); cada una abre CU-04. */
export function PendingToRewrite() {
  const t = useTranslations();
  const { data: home, isPending } = useHome();

  if (isPending || !home) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="size-6 animate-spin text-muted-foreground" aria-label={t("common.loading")} />
      </div>
    );
  }
  const phrases = home.pendingPhrases ?? [];
  return phrases.length > 0 ? <PendingPhraseList phrases={phrases} /> : <NoPendingPhrase />;
}
