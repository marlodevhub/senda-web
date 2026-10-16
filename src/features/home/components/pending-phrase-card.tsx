"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Feather } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { HomePendingPhrase } from "@/features/home/api/get-home";
import { patternLabelKey } from "@/lib/pattern-labels";
import { cn } from "@/lib/utils";
import type { Dimension } from "@/types/dimension";

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

const DIMENSION_TAG: Record<Dimension, string> = {
  D1: "bg-root-tint text-root-ink",
  D2: "bg-bloom-tint text-bloom-ink",
  D3: "bg-flow-tint text-flow-ink",
};

/**
 * Escritorio (CU-05): todas las frases por reescribir, de la más reciente. Cada una lleva directo a CU-04 con
 * ese hallazgo; el tipo va en lenguaje amable (el mismo del Espejo), nunca como etiqueta clínica.
 */
export function PendingPhraseList({ phrases }: { phrases: HomePendingPhrase[] }) {
  const t = useTranslations();

  return (
    <section
      aria-labelledby="pending-list"
      className="flex flex-col gap-3 rounded-lg bg-grad-dawn-soft p-4 shadow-card"
    >
      <div className="flex items-baseline justify-between gap-2">
        <h2 id="pending-list" className="text-xs font-bold tracking-wide text-root-ink uppercase">
          {t("home.pendingListTitle")}
        </h2>
        <span className="text-base text-muted-foreground tabular-nums">{phrases.length}</span>
      </div>
      <ul className="flex max-h-[26rem] flex-col gap-2 overflow-y-auto">
        {phrases.map((phrase) => (
          <li key={phrase.findingId}>
            <Link
              href={`/reescritura/${phrase.journalEntryId}?findingId=${phrase.findingId}`}
              aria-label={t("home.pendingRewriteThis", { fragment: phrase.fragment })}
              className="group flex items-center gap-3 rounded-md bg-card p-3 shadow-card transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-ring"
            >
              <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                <span className="font-display text-base leading-snug text-foreground before:content-['“'] after:content-['”']">
                  {phrase.fragment}
                </span>
                <span
                  className={cn(
                    "self-start rounded-full px-2.5 py-0.5 text-sm font-semibold",
                    DIMENSION_TAG[phrase.dimension],
                  )}
                >
                  {t(patternLabelKey(phrase.pattern))}
                </span>
              </span>
              <span
                aria-hidden
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[image:var(--grad-hero)] text-white transition-transform group-hover:translate-x-0.5"
              >
                <Feather className="size-4" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
