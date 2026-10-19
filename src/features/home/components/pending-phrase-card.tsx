"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Feather } from "lucide-react";
import { PhraseSceneCard } from "@/components/feedback/phrase-scene-card";
import { Button } from "@/components/ui/button";
import type { HomePendingPhrase } from "@/features/home/api/get-home";
import { patternLabelKey, patternTitleKey } from "@/lib/pattern-labels";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

/**
 * Tarjeta "frase pendiente" de Inicio en móvil (RN-IN-02): el hallazgo visible más reciente sin reescribir, como
 * tarjeta de clima de su tipo de frase. Toca el botón → abre CU-04 con su registro.
 */
export function PendingPhraseCard({
  fragment,
  pattern,
  onRewrite,
}: {
  fragment: string;
  pattern: string;
  onRewrite?: () => void;
}) {
  const t = useTranslations();

  return (
    <div className="flex flex-col gap-2.5 rounded-lg bg-card p-4 shadow-card">
      <span className="text-xs font-bold tracking-wide text-muted-foreground uppercase">{t("home.pendingLabel")}</span>
      <PhraseSceneCard
        fragment={fragment}
        title={t(patternTitleKey(pattern))}
        label={t(patternLabelKey(pattern))}
        pattern={pattern}
      />
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

/**
 * Escritorio (CU-05): todas las frases por reescribir, de la más reciente, dos por fila. Cada una es una tarjeta de clima
 * de su tipo de frase (pattern-style): de frente, su paisaje y su título; "Ver" la da vuelta y muestra la frase, y la
 * flechita abre su registro (CU-11). Nunca como etiqueta clínica.
 */
export function PendingPhraseList({ phrases }: { phrases: HomePendingPhrase[] }) {
  const t = useTranslations();
  const listRef = useRef<HTMLDivElement>(null);
  const maxHeight = useHeightToViewportBottom(listRef);
  const { canScrollDown, onScroll } = useScrollEdges(listRef, phrases.length, maxHeight);

  return (
    <section aria-labelledby="pending-list" className="relative overflow-hidden rounded-lg bg-card shadow-card">
      {/*
        Toda la tarjeta se desplaza: la cabecera queda fija arriba, en blanco, con un difuminado debajo, y las frases
        pasan por debajo; abajo, un desvanecido de vidrio indica que hay más (solo cuando las hay). Ambos van por encima de la frase con el mouse (z-20), así no se cortan.
      */}
      <div ref={listRef} style={{ maxHeight }} onScroll={onScroll} className="overflow-y-auto">
        <header className="sticky top-0 z-20 flex items-start gap-3 bg-card px-5 pt-5 pb-3">
          {/* Las tarjetas pasan por debajo del título y se pierden en un difuminado blanco, sin chocar con él. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-full h-5 bg-linear-to-b from-card to-transparent"
          />
          <span
            aria-hidden
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-celeste text-bloom-ink"
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
        <ul className="grid grid-cols-2 gap-3 px-5 pt-5 pb-5">
          {phrases.map((phrase) => (
            <li key={phrase.findingId} className="relative flex hover:z-10 focus-within:z-10">
              <PhraseSceneCard
                className="w-full"
                fragment={phrase.fragment}
                title={t(patternTitleKey(phrase.pattern))}
                label={t(patternLabelKey(phrase.pattern))}
                pattern={phrase.pattern}
                href={routes.entry(phrase.journalEntryId)}
                linkLabel={t("home.pendingOpenEntry", { fragment: phrase.fragment })}
              />
            </li>
          ))}
        </ul>
      </div>
      <ScrollFade visible={canScrollDown} />
    </section>
  );
}

/** Lo que queda debajo de la tarjeta: el margen de main en escritorio (1,25rem), igual al de la barra lateral. */
const BOTTOM_SPACE_PX = 20;
/** La cabecera y al menos una frase completa, aunque la ventana sea muy baja. */
const MIN_LIST_PX = 260;

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

/** Desvanecido con desenfoque en el borde de arriba o de abajo de la lista; deja libre la barra de scroll. */
function ScrollFade({ visible }: { visible: boolean }) {
  return (
    <div
      aria-hidden
      className={cn(
        // El mismo vidrio que se desvanece del calendario de Inicio (glass-edge-up en globals.css), sobre todo (z-20).
        "glass-edge-up pointer-events-none absolute inset-x-0 bottom-0 z-20 h-10 transition-opacity duration-200",
        visible ? "opacity-100" : "opacity-0",
      )}
    />
  );
}

/** Si la lista tiene más contenido arriba o abajo del que se ve (para mostrar los desvanecidos). */
function useScrollEdges(ref: React.RefObject<HTMLElement | null>, itemCount: number, maxHeight: number | undefined) {
  const [edges, setEdges] = useState({ canScrollUp: false, canScrollDown: false });

  const measure = useCallback(() => {
    const element = ref.current;
    if (!element) return;
    const canScrollUp = element.scrollTop > 1;
    const canScrollDown = element.scrollTop + element.clientHeight < element.scrollHeight - 1;
    setEdges((previous) =>
      previous.canScrollUp === canScrollUp && previous.canScrollDown === canScrollDown
        ? previous
        : { canScrollUp, canScrollDown },
    );
  }, [ref]);

  // Al cambiar las frases o el alto disponible, el borde de abajo puede aparecer o desaparecer.
  useEffect(measure, [measure, itemCount, maxHeight]);

  return { ...edges, onScroll: measure };
}
