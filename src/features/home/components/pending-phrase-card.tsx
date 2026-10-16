"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight, Feather } from "lucide-react";
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

/** El punto de color de cada dimensión, junto al tipo de frase. */
const DIMENSION_DOT: Record<Dimension, string> = {
  D1: "bg-root",
  D2: "bg-bloom",
  D3: "bg-flow",
};

/**
 * Escritorio (CU-05): todas las frases por reescribir, de la más reciente. Cada una, en celeste, lleva directo a
 * CU-04 con ese hallazgo; debajo, su tipo en lenguaje amable (el mismo del Espejo) como texto, con un punto del
 * color de su dimensión. Nunca como etiqueta clínica.
 */
export function PendingPhraseList({ phrases, className }: { phrases: HomePendingPhrase[]; className?: string }) {
  const t = useTranslations();

  return (
    <section
      aria-labelledby="pending-list"
      className={cn("flex flex-col gap-4 rounded-lg bg-card p-5 shadow-card", className)}
    >
      <header className="flex items-start gap-3">
        <span
          aria-hidden
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-celeste text-flow-ink"
        >
          <Feather className="size-5" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h2 id="pending-list" className="font-heading text-lg font-bold text-foreground">
            {t("home.pendingListTitle")}
          </h2>
          <p className="text-base text-muted-foreground">{t("home.pendingListHint")}</p>
        </div>
        <span className="rounded-full bg-celeste px-3 py-0.5 text-base font-bold text-foreground tabular-nums">
          {phrases.length}
        </span>
      </header>

      <ul className="flex max-h-[28rem] flex-col gap-2 overflow-y-auto pr-1 fit:max-h-none fit:min-h-0 fit:flex-1">
        {phrases.map((phrase) => (
          <li key={phrase.findingId}>
            <Link
              href={`/reescritura/${phrase.journalEntryId}?findingId=${phrase.findingId}`}
              aria-label={t("home.pendingRewriteThis", { fragment: phrase.fragment })}
              className="group flex items-center gap-3 rounded-md bg-celeste px-4 py-3 transition-colors hover:bg-celeste-strong focus-visible:outline-2 focus-visible:outline-ring"
            >
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="font-display text-base leading-snug font-semibold text-foreground before:content-['“'] after:content-['”']">
                  {phrase.fragment}
                </span>
                <span className="flex items-start gap-2 text-base leading-snug text-muted-foreground">
                  <span
                    aria-hidden
                    className={cn("mt-[0.45rem] size-2 shrink-0 rounded-full", DIMENSION_DOT[phrase.dimension])}
                  />
                  {t(patternLabelKey(phrase.pattern))}
                </span>
              </span>
              <span
                aria-hidden
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[image:var(--grad-hero)] text-white shadow-bloom transition-transform group-hover:translate-x-0.5"
              >
                <ArrowRight className="size-4" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
