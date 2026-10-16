"use client";

import { useTranslations } from "next-intl";
import { Feather } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Tarjeta "frase pendiente" de Inicio (RN-IN-02): el hallazgo visible más
 * reciente sin reescribir. Toca el botón → abre CU-04 con ese hallazgo.
 */
export function PendingPhraseCard({ fragment, onRewrite }: { fragment: string; onRewrite?: () => void }) {
  const t = useTranslations();

  return (
    <div className="flex flex-col gap-2.5 rounded-lg bg-grad-dawn-soft p-4 shadow-card">
      <span className="text-xs font-bold tracking-wide text-root-ink uppercase">{t("home.pendingLabel")}</span>
      <p className="font-display text-base leading-snug text-foreground before:content-['“'] after:content-['”']">
        {fragment}
      </p>
      {/* Mismo ancho y forma que el botón Escribir del check-in. */}
      <Button variant="hero" size="xl" className="w-full rounded-full" onClick={onRewrite}>
        <Feather className="size-4" aria-hidden />
        {t("home.pendingRewrite")}
      </Button>
    </div>
  );
}

export function NoPendingPhrase() {
  const t = useTranslations();

  return (
    <div className="flex items-center gap-3 rounded-lg bg-card p-4 shadow-card">
      <p className="text-sm text-muted-foreground">{t("home.noPending")}</p>
    </div>
  );
}
