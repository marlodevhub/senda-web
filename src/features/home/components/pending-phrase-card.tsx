"use client";

import { useEffect, useRef, useState } from "react";
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
export function PendingPhraseList({ phrases }: { phrases: HomePendingPhrase[] }) {
  const t = useTranslations();
  const listRef = useRef<HTMLUListElement>(null);
  const maxHeight = useHeightToViewportBottom(listRef);

  return (
    <section aria-labelledby="pending-list" className="flex flex-col gap-4 rounded-lg bg-card p-5 shadow-card">
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

      <ul ref={listRef} style={{ maxHeight }} className="flex flex-col gap-2 overflow-y-auto pr-1">
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

/** Lo que queda debajo de la lista: el padding de la tarjeta (1,25rem) y el de main en escritorio (2,5rem). */
const BOTTOM_SPACE_PX = 60;
/** Al menos una frase completa, aunque la ventana sea muy baja. */
const MIN_LIST_PX = 176;

/**
 * El alto de la lista para que la tarjeta llegue justo al borde de abajo de la ventana (sin pasarse), según el
 * alto de la pantalla y lo que haya arriba (p. ej. la invitación del check-in). Se recalcula al cambiar el tamaño de
 * la ventana o del contenido.
 */
function useHeightToViewportBottom(ref: React.RefObject<HTMLElement | null>): number | undefined {
  const [maxHeight, setMaxHeight] = useState<number>();

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const update = () => {
      const top = element.getBoundingClientRect().top + window.scrollY;
      setMaxHeight(Math.max(MIN_LIST_PX, Math.floor(window.innerHeight - top - BOTTOM_SPACE_PX)));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(document.body);
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [ref]);

  return maxHeight;
}
