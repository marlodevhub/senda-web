"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Dialog as DialogPrimitive } from "radix-ui";
import { Button } from "@/components/ui/button";
import { MoodFace, type Mood } from "@/components/icons/mood-face";
import { EmotionCharacter, EmotionDefs } from "@/components/illustrations/emotion-characters";
import { isTourSeen, markTourSeen } from "@/components/tour/tour-seen";
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

type Layout = { rect: DOMRect | null; vw: number; vh: number };

/** El elemento visible con ese `data-tour` (la barra inferior y la lateral tienen cada una el suyo). */
function findTarget(target: string | undefined): DOMRect | null {
  if (!target) {
    return null;
  }
  for (const el of document.querySelectorAll(`[data-tour="${target}"]`)) {
    const rect = el.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      return rect;
    }
  }
  return null;
}

/**
 * Dónde va la tarjeta: al lado de la barra lateral (tablet y escritorio),
 * encima del dock (móvil), debajo de la campana o al centro si no ilumina nada.
 */
function cardPlacement({ rect, vw, vh }: Layout): React.CSSProperties {
  if (!rect) {
    return { left: "50%", top: "50%", transform: "translate(-50%, -50%)" };
  }
  if (vw >= 768 && rect.right < vw / 2) {
    const top = Math.min(Math.max(rect.top + rect.height / 2, 260), vh - 260);
    return { left: rect.right + 24, top, transform: "translateY(-50%)" };
  }
  if (rect.top > vh / 2) {
    return { left: "50%", bottom: vh - rect.top + 16, transform: "translateX(-50%)" };
  }
  if (rect.left > vw / 2) {
    return { right: Math.max(vw - rect.right, 16), top: rect.bottom + 16 };
  }
  return { left: "50%", top: rect.bottom + 16, transform: "translateX(-50%)" };
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

  // La posición de lo que se ilumina se mide en el navegador y se vuelve a medir al cambiar el tamaño.
  useEffect(() => {
    const measure = () =>
      setLayout({ rect: findTarget(current.target), vw: window.innerWidth, vh: window.innerHeight });
    const frame = window.requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", measure);
    };
  }, [current.target]);

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
          style={layout ? cardPlacement(layout) : { visibility: "hidden" }}
          className="fixed z-50 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-[1.75rem] bg-card text-card-foreground shadow-card outline-none"
        >
          <div
            key={current.id}
            className="motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95 motion-safe:duration-300"
          >
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
                    <MoodFace key={mood} mood={mood} active className="size-9" />
                  ))}
                </div>
              )}
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
