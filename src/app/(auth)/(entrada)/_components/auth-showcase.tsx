"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";
import { MoodFace } from "@/components/icons/mood-face";
import type { Garden } from "@/features/progress/api/get-garden";
import { GardenScene } from "@/features/progress/components/garden-scene";
import { Petals } from "@/features/progress/components/garden-view";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

/** Un jardín de muestra para la ilustración: no son datos de nadie. */
const SAMPLE_GARDEN: Garden = {
  general: { elements: 12, stage: 4 },
  raices: { elements: 5, stage: 3 },
  flores: { elements: 8, stage: 4 },
  ritmo: { elements: 3, stage: 2 },
  especiales: ["S1", "S3"],
};

const SLIDES = ["access.showcaseSlide1", "access.showcaseSlide2", "access.showcaseSlide3"] as const;
const SLIDE_MS = 6000;

/**
 * Solo se monta una de las dos ilustraciones: las dos dibujan el mismo jardín y comparten los ids de sus
 * degradados SVG, y si el que queda oculto (display: none) los define primero, la colina no se pinta.
 */
const WIDE_QUERY = "(min-width: 1024px)";

/**
 * Panel ilustrado de las pantallas de entrada (login, activar, recuperar):
 * el jardín de Senda con caras de ánimo y una frase del frasco alrededor, y
 * tres ideas de la app que rotan. Decorativo salvo los puntos, que eligen la
 * idea (y detienen la rotación, que tampoco corre si se pide menos movimiento).
 */
export function AuthShowcase({ className }: { className?: string }) {
  const t = useTranslations();
  const isWide = useMediaQuery(WIDE_QUERY);
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [slide, setSlide] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  useEffect(() => {
    if (!autoplay || reduceMotion) {
      return;
    }
    const id = window.setInterval(() => setSlide((current) => (current + 1) % SLIDES.length), SLIDE_MS);
    return () => window.clearInterval(id);
  }, [autoplay, reduceMotion]);

  if (!isWide) {
    return null;
  }

  return (
    <section
      aria-label={t("access.showcaseLabel")}
      className={cn("garden-scene relative isolate flex flex-col overflow-hidden rounded-[2rem]", className)}
    >
      <Petals />

      <div className="relative flex flex-1 items-end justify-center pt-56">
        <Swirl />

        {/* Las caras de ánimo y la frase del frasco acompañan al jardín, como en la app. */}
        <div aria-hidden className="auth-float absolute top-[9%] left-[8%] z-10 flex items-center gap-3">
          <Bubble className="static bg-sprout-tint text-sprout-ink">
            <MoodFace mood={4} active className="size-9" />
          </Bubble>
          <p className="rounded-full bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-card">
            {t("access.showcaseMood")}
          </p>
        </div>
        <Bubble className="top-[30%] left-[16%] bg-bloom-tint text-bloom-ink [animation-delay:-2s]">
          <MoodFace mood={5} active className="size-9" />
        </Bubble>
        <div
          aria-hidden
          className="auth-float absolute top-[13%] right-[7%] z-10 w-56 rounded-[1.25rem] bg-card p-4 text-foreground shadow-card [animation-delay:-1s]"
        >
          <p className="flex items-center gap-1.5 font-heading text-base font-bold">
            <Sparkles className="size-4 text-bloom-ink" />
            {t("access.showcaseJarTitle")}
          </p>
          <p className="mt-1 text-sm leading-snug">{t("access.showcaseJarPhrase")}</p>
          <span className="mt-3 inline-block rounded-full bg-flow-tint px-3 py-1 text-xs font-semibold text-flow-ink">
            {t("access.showcaseJarTag")}
          </span>
        </div>

        {/* Más ancha que el panel: la colina sigue por los lados y las plantas se ven grandes. */}
        <div aria-hidden className="w-[115%] max-w-none shrink-0">
          <GardenScene garden={SAMPLE_GARDEN} />
        </div>
      </div>

      <div className="relative -mt-px flex flex-col items-center gap-5 bg-[linear-gradient(to_bottom,var(--garden-hill-mid),var(--garden-hill-deep))] px-8 pt-4 pb-10 text-center text-(--garden-panel-ink)">
        <div className="flex gap-1">
          {SLIDES.map((key, index) => (
            <button
              key={key}
              type="button"
              aria-label={t("access.showcaseGoTo", { number: index + 1 })}
              aria-current={index === slide}
              onClick={() => {
                setSlide(index);
                setAutoplay(false);
              }}
              className="group flex size-6 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-white"
            >
              <span
                className={cn(
                  "h-2 rounded-full bg-white transition-all",
                  index === slide ? "w-6" : "w-2 opacity-50 group-hover:opacity-80",
                )}
              />
            </button>
          ))}
        </div>
        <p className="max-w-md font-heading text-2xl leading-snug font-bold text-balance">{t(SLIDES[slide])}</p>
      </div>
    </section>
  );
}

function Bubble({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      aria-hidden
      className={cn(
        "auth-float absolute z-10 flex size-16 items-center justify-center rounded-full ring-4 ring-card shadow-card",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Trazo punteado que envuelve la escena, como un camino (la "senda"). */
function Swirl() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 400 200"
      className="pointer-events-none absolute inset-x-0 top-10 mx-auto w-[85%] max-w-xl text-sprout"
      fill="none"
    >
      <path
        d="M30 170 C 10 110, 70 60, 110 90 C 140 112, 120 40, 170 30 C 220 20, 210 90, 250 70 C 290 50, 300 10, 340 30 C 380 50, 370 120, 390 150"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="2 9"
        opacity="0.8"
      />
    </svg>
  );
}

/** Móvil y tablet: el mismo jardín en una franja sobre el formulario (más alta en tablet). */
export function AuthBanner({ className }: { className?: string }) {
  const t = useTranslations();
  const isWide = useMediaQuery(WIDE_QUERY);
  if (isWide) {
    return null;
  }

  return (
    <div
      aria-hidden
      className={cn("garden-scene relative isolate h-44 overflow-hidden rounded-[1.75rem] sm:h-[36dvh]", className)}
    >
      <Petals />
      <div className="absolute -bottom-6 left-1/2 w-[min(100%,26rem)] -translate-x-1/2 sm:w-[min(100%,calc(36dvh*1.7))]">
        <GardenScene garden={SAMPLE_GARDEN} />
      </div>
      <div className="auth-float absolute top-4 left-4 flex items-center gap-2 sm:top-6 sm:left-6">
        <Bubble className="static size-12 bg-sprout-tint text-sprout-ink ring-2 sm:size-16 sm:ring-4">
          <MoodFace mood={4} active className="size-7 sm:size-9" />
        </Bubble>
        <p className="hidden rounded-full bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-card sm:block">
          {t("access.showcaseMood")}
        </p>
      </div>
      <Bubble className="top-8 right-5 size-12 bg-bloom-tint text-bloom-ink ring-2 [animation-delay:-2s] sm:top-10 sm:right-8 sm:size-16 sm:ring-4">
        <MoodFace mood={5} active className="size-7 sm:size-9" />
      </Bubble>
    </div>
  );
}
