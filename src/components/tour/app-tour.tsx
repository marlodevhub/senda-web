"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Dialog as DialogPrimitive } from "radix-ui";
import { Button } from "@/components/ui/button";
import { MoodOrb, type Mood } from "@/components/icons/mood-orb";
import { EmotionCharacter, EmotionDefs } from "@/components/illustrations/emotion-characters";
import { isTourSeen, markTourSeen } from "@/components/tour/tour-seen";
import { TourGarden } from "@/components/tour/tour-garden";
import { SPEAKER_KEY, TOUR_STEPS } from "@/components/tour/tour-steps";
import { cn } from "@/lib/utils";

type Tour = { start: () => void };

const TourContext = createContext<Tour | null>(null);

/** Para abrir el tutorial desde otra pantalla (Perfil → Ayuda e información). */
export function useTour(): Tour | null {
  return useContext(TourContext);
}

/** Espera antes de abrirlo solo, para que primero se vea Inicio. */
const AUTO_START_MS = 700;
const SPOT_PADDING = 6;

const MARGIN = 16;

type Layout = { rect: DOMRect | null; vw: number; vh: number };

/** El primero de esos `data-tour` que esté a la vista (la barra inferior y la lateral tienen cada una el suyo). */
function findTarget(targets: string[] | undefined): DOMRect | null {
  for (const target of targets ?? []) {
    for (const el of document.querySelectorAll(`[data-tour="${target}"]`)) {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        return rect;
      }
    }
  }
  return null;
}

/**
 * Dónde va la tarjeta, según su alto real (`cardHeight`): al lado de la barra
 * lateral (tablet y escritorio), si no debajo o encima de lo iluminado (donde
 * haya más lugar, con scroll si aun así no cabe), o al centro si no ilumina nada.
 */
/** Ancho máximo de la tarjeta (24rem, igual que su clase `w-[min(24rem,…)]`). */
const CARD_MAX_WIDTH = 384;

function cardPlacement({ rect, vw, vh }: Layout, cardHeight: number): React.CSSProperties {
  if (!rect) {
    return { left: "50%", top: "50%", transform: "translate(-50%, -50%)", maxHeight: vh - MARGIN * 2 };
  }
  if (vw >= 768 && rect.right < vw / 2) {
    const centered = rect.top + rect.height / 2 - cardHeight / 2;
    return { left: rect.right + 24, top: Math.max(MARGIN, Math.min(centered, vh - cardHeight - MARGIN)) };
  }
  // En móvil la tarjeta ocupa casi todo el ancho: siempre centrada.
  const horizontal: React.CSSProperties =
    vw >= 768 && rect.left > vw / 2
      ? { right: Math.max(vw - rect.right, MARGIN) }
      : { left: "50%", transform: "translateX(-50%)" };
  const below = vh - rect.bottom - MARGIN * 2;
  const above = rect.top - MARGIN * 2;
  if (cardHeight <= below) {
    return { ...horizontal, top: rect.bottom + MARGIN, maxHeight: below };
  }
  if (cardHeight <= above) {
    return { ...horizontal, bottom: vh - rect.top + MARGIN, maxHeight: above };
  }
  // No entra completa ni arriba ni abajo (p. ej. una tarjeta en medio de Inicio): al costado del objetivo, con el
  // alto de la pantalla; si tampoco hay lugar al costado, centrada. Así la tarjeta se ve entera, sin scroll.
  const cardWidth = Math.min(CARD_MAX_WIDTH, vw - MARGIN * 2);
  const top = Math.max(MARGIN, Math.min(rect.top + rect.height / 2 - cardHeight / 2, vh - cardHeight - MARGIN));
  const maxHeight = vh - MARGIN * 2;
  if (vw - rect.right - MARGIN * 2 >= cardWidth) {
    return { left: rect.right + MARGIN, top, maxHeight };
  }
  if (rect.left - MARGIN * 2 >= cardWidth) {
    return { right: vw - rect.left + MARGIN, top, maxHeight };
  }
  return { left: "50%", top: "50%", transform: "translate(-50%, -50%)", maxHeight };
}

/**
 * Tutorial de la app: las emociones de Senda guían un recorrido por la
 * interfaz real, en el orden en que se usa, iluminando cada pestaña. Se abre
 * solo la primera vez que se llega a Inicio; se puede ir atrás, adelante u
 * omitir (también con Escape), y repetir desde Perfil.
 */
export function TourProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [step, setStep] = useState<number | null>(null);

  useEffect(() => {
    if (pathname !== "/inicio" || isTourSeen()) {
      return;
    }
    const id = window.setTimeout(() => setStep((current) => current ?? 0), AUTO_START_MS);
    return () => window.clearTimeout(id);
  }, [pathname]);

  const close = () => {
    markTourSeen();
    setStep(null);
  };

  return (
    <TourContext.Provider value={{ start: () => setStep(0) }}>
      {children}
      {step !== null && <TourOverlay step={step} onStep={setStep} onClose={close} />}
    </TourContext.Provider>
  );
}

function TourOverlay({ step, onStep, onClose }: { step: number; onStep: (step: number) => void; onClose: () => void }) {
  const t = useTranslations();
  const nextRef = useRef<HTMLButtonElement>(null);
  const current = TOUR_STEPS[step];
  const isFirst = step === 0;
  const isLast = step === TOUR_STEPS.length - 1;
  const [layout, setLayout] = useState<Layout | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardHeight, setCardHeight] = useState(0);

  // La posición de lo que se ilumina se mide en el navegador y se vuelve a medir al cambiar el tamaño.
  useEffect(() => {
    const measure = () => {
      const vw = window.innerWidth;
      const targets = vw < 768 && current.mobileTarget ? current.mobileTarget : current.target;
      setLayout({ rect: findTarget(targets), vw, vh: window.innerHeight });
      setCardHeight(cardRef.current?.scrollHeight ?? 0);
    };
    const frame = window.requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", measure);
    };
  }, [current]);

  // El alto de la tarjeta cambia con cada paso: se usa para que nunca se salga de la pantalla.
  useEffect(() => {
    const card = cardRef.current;
    if (!card) {
      return;
    }
    const observer = new ResizeObserver(() => setCardHeight(card.scrollHeight));
    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  const rect = layout?.rect ?? null;
  const speaker = current.cast.length === 1 ? t(SPEAKER_KEY[current.cast[0]]) : t("tour.speakerAll");

  return (
    <DialogPrimitive.Root open onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        <EmotionDefs />
        {rect ? (
          <div
            aria-hidden
            className="pointer-events-none fixed z-50 rounded-[1.25rem] shadow-[0_0_0_9999px_rgb(20_15_30/0.6)] ring-4 ring-white/80 transition-all duration-300 motion-reduce:transition-none"
            style={{
              left: rect.left - SPOT_PADDING,
              top: rect.top - SPOT_PADDING,
              width: rect.width + SPOT_PADDING * 2,
              height: rect.height + SPOT_PADDING * 2,
            }}
          />
        ) : (
          <div aria-hidden className="fixed inset-0 z-50 bg-[rgb(20_15_30/0.6)]" />
        )}
        <DialogPrimitive.Content
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            nextRef.current?.focus();
          }}
          // Un toque fuera no lo cierra: para salir está "Omitir".
          onPointerDownOutside={(event) => event.preventDefault()}
          ref={cardRef}
          style={layout ? cardPlacement(layout, cardHeight) : { visibility: "hidden" }}
          className="fixed z-50 w-[min(24rem,calc(100vw-2rem))] overflow-y-auto rounded-[1.75rem] bg-card text-card-foreground shadow-card outline-none"
        >
          <div
            key={current.id}
            className="motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95 motion-safe:duration-300"
          >
            {current.scene === "garden" ? (
              // Progreso: la Alegría parada en un jardín panorámico.
              <div aria-hidden>
                <TourGarden>
                  <EmotionCharacter emotion={current.cast[0]} className="w-20" />
                </TourGarden>
              </div>
            ) : (
              <div
                aria-hidden
                className="flex h-32 items-end justify-center gap-1 bg-[radial-gradient(circle_at_50%_110%,var(--bloom-tint),var(--flow-tint)_60%,var(--card))] px-6 pb-3"
              >
                {current.cast.map((emotion, index) => (
                  <EmotionCharacter
                    key={emotion}
                    emotion={emotion}
                    delay={`${-index * 0.7}s`}
                    className={current.cast.length === 1 ? "w-24" : "w-14"}
                  />
                ))}
              </div>
            )}

            <div className="flex flex-col gap-3 p-6 pt-4">
              <p className="self-start rounded-full bg-muted px-3 py-0.5 text-sm font-semibold text-muted-foreground">
                {speaker}
              </p>
              <DialogPrimitive.Title className="font-heading text-xl leading-tight font-bold text-foreground">
                {t(`tour.${current.id}Title`)}
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="text-base text-foreground/85">
                {t(`tour.${current.id}Body`)}
              </DialogPrimitive.Description>
              {current.moods && (
                <div aria-hidden className="flex justify-between px-2 text-flow-ink">
                  {([1, 2, 3, 4, 5] as Mood[]).map((mood) => (
                    <MoodOrb key={mood} mood={mood} decorative animated className="size-9" />
                  ))}
                </div>
              )}
              {current.preview && <ScreenPreview kind={current.preview} />}
            </div>
          </div>

          <div className="flex flex-col gap-4 px-6 pb-6">
            <div className="flex items-center justify-center gap-1.5">
              {TOUR_STEPS.map((item, index) => (
                <span
                  key={item.id}
                  aria-hidden
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    index === step ? "w-5 bg-bloom-ink" : "w-1.5 bg-foreground/20",
                  )}
                />
              ))}
              <span className="sr-only">{t("tour.stepOf", { current: step + 1, total: TOUR_STEPS.length })}</span>
            </div>
            <div className="flex items-center gap-2">
              {!isLast && (
                <Button variant="ghost" onClick={onClose} className="mr-auto">
                  {t("tour.skip")}
                </Button>
              )}
              {!isFirst && (
                <Button variant="outline" onClick={() => onStep(step - 1)} className={cn(isLast && "mr-auto")}>
                  {t("tour.back")}
                </Button>
              )}
              <Button
                ref={nextRef}
                variant="hero"
                onClick={() => (isLast ? onClose() : onStep(step + 1))}
                className="rounded-full px-5"
              >
                {isLast ? t("tour.finish") : t("tour.next")}
              </Button>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

/** Un ejemplo de Espejo o Reescritura, que no tienen pestaña propia. Decorativo: el texto del paso ya lo explica. */
function ScreenPreview({ kind }: { kind: "mirror" | "rewrite" }) {
  const t = useTranslations();
  const phrase = t("tour.previewPhrase");

  if (kind === "mirror") {
    return (
      <div aria-hidden className="flex flex-col gap-2 rounded-[1.25rem] bg-muted p-4 text-sm text-foreground">
        <p>
          {t("tour.previewEntry")}{" "}
          <mark className="rounded bg-root-tint px-1 font-semibold text-root-ink">{phrase}</mark>
        </p>
        <span className="self-start rounded-full bg-root-tint px-2.5 py-0.5 text-xs font-semibold text-root-ink">
          {t("tour.previewDimension")}
        </span>
      </div>
    );
  }
  return (
    <div aria-hidden className="flex flex-col gap-2 rounded-[1.25rem] bg-muted p-4 text-sm">
      <p className="text-muted-foreground line-through decoration-2">{phrase}</p>
      <p className="rounded-xl bg-sprout-tint px-3 py-2 font-semibold text-sprout-ink">{t("tour.previewRewrite")}</p>
    </div>
  );
}
