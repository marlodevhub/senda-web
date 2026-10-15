"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";
import { MoodFace } from "@/components/icons/mood-face";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

const SLIDES = ["access.showcaseSlide1", "access.showcaseSlide2", "access.showcaseSlide3"] as const;
const SLIDE_MS = 6000;

/**
 * Lo que acompaña al paisaje en escritorio: caras de ánimo, una frase del
 * frasco y tres ideas de la app que rotan. Decorativo salvo los puntos, que
 * eligen la idea (y detienen la rotación, que tampoco corre si se pide menos
 * movimiento).
 */
export function AuthCompanions({ className }: { className?: string }) {
  const t = useTranslations();
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

  return (
    <section aria-label={t("access.showcaseLabel")} className={cn("relative", className)}>
      <div className="absolute inset-x-0 top-[9%] flex flex-col items-center gap-4 px-8 text-center">
        <p className="max-w-lg font-heading text-3xl leading-snug font-bold text-balance text-foreground">
          {t(SLIDES[slide])}
        </p>
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
              className="group flex size-6 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-ring"
            >
              <span
                className={cn(
                  "h-2 rounded-full bg-foreground transition-all",
                  index === slide ? "w-6" : "w-2 opacity-30 group-hover:opacity-60",
                )}
              />
            </button>
          ))}
        </div>
      </div>

      <div aria-hidden className="auth-float absolute top-[40%] left-[6%] flex items-center gap-3">
        <Bubble className="bg-sprout-tint text-sprout-ink">
          <MoodFace mood={4} active className="size-9" />
        </Bubble>
        <p className="rounded-full bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-card">
          {t("access.showcaseMood")}
        </p>
      </div>
      <Bubble className="absolute top-[30%] right-[8%] bg-bloom-tint text-bloom-ink [animation-delay:-2s]">
        <MoodFace mood={5} active className="size-9" />
      </Bubble>
      <div
        aria-hidden
        className="auth-float absolute bottom-[26%] left-[14%] w-56 rounded-[1.25rem] bg-card/90 p-4 text-foreground shadow-card backdrop-blur-md [animation-delay:-1s]"
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
    </section>
  );
}

function Bubble({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      aria-hidden
      className={cn(
        "auth-float flex size-16 items-center justify-center rounded-full shadow-card ring-4 ring-card",
        className,
      )}
    >
      {children}
    </div>
  );
}
