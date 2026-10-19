"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { MOOD_INK, MoodOrb, moodGradient, type Mood } from "@/components/icons/mood-orb";

const MOODS: Mood[] = [1, 2, 3, 4, 5];

/**
 * Selector de ánimo de 5 caritas animadas. Lo usan CU-01 (Diario), CU-06
 * (check-in de Inicio) y CU-04 (ánimo posterior a una reescritura) — ver
 * Senda/docs/casos-de-uso/{nucleo,acompanamiento}.md. `label` es la pregunta
 * de cada pantalla, con la que se anuncia el grupo. `bubbleCount` (check-in de
 * Inicio) pone al inicio de la burbuja cuántas veces marcó hoy esa carita.
 */
export function MoodPicker({
  label,
  value,
  onChange,
  size = "default",
  bubbleCount,
  feedback = true,
  className,
}: {
  label: string;
  value?: Mood;
  onChange: (mood: Mood) => void;
  size?: "default" | "compact";
  bubbleCount?: Partial<Record<Mood, number>>;
  /** false: sin el salto de la elegida ni la burbuja (el Diario en móvil se cierra al elegir). */
  feedback?: boolean;
  className?: string;
}) {
  const t = useTranslations();
  const orbSize = size === "compact" ? "size-10" : "size-12";
  // La burbuja con el nombre sale solo al tocar (no al abrir con un ánimo ya guardado); `taps` la repite cada vez.
  const [bubble, setBubble] = useState<{ mood: Mood; taps: number } | null>(null);

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn("flex items-center justify-between gap-1 rounded-lg bg-card px-3 py-3 shadow-card", className)}
    >
      {MOODS.map((mood) => {
        const active = value === mood;
        return (
          <button
            key={mood}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={t(`mood.${mood}`)}
            onClick={() => {
              if (feedback) {
                setBubble((previous) => ({ mood, taps: (previous?.taps ?? 0) + 1 }));
              }
              onChange(mood);
            }}
            className="group relative flex flex-1 justify-center rounded-lg py-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {/* El salto al elegir va en este contenedor; el movimiento propio, en la carita. */}
            <span
              key={active ? "on" : "off"}
              className={cn(
                "relative z-10 inline-flex rounded-full transition-[scale,filter] duration-300 ease-[cubic-bezier(.34,1.56,.64,1)] group-hover:scale-110",
                active && feedback && "mood-pop scale-115 ring-4 ring-bloom-tint",
                // Las no elegidas siguen con su color (sin apagarlas): solo un poco más chicas, para que la elegida resalte.
                value !== undefined && !active && "scale-95",
              )}
            >
              {/* Solo se mueve la elegida (sin elegir, todas, para invitar): cinco animaciones sin parar cuestan en el celular. */}
              <MoodOrb mood={mood} animated={value === undefined || active} decorative className={orbSize} />
            </span>
            {/* Burbuja con el nombre que sube y se desvanece: no ocupa lugar, la tarjeta no cambia de tamaño.
                El lector de pantalla ya anuncia el ánimo en el botón. */}
            {bubble?.mood === mood && (
              <span
                key={bubble.taps}
                aria-hidden
                // Siempre por encima de la carita (z-20; ella va en z-10, aun con el zoom): sale de su borde y sube.
                className="mood-bubble pointer-events-none absolute bottom-[calc(100%+0.75rem)] left-1/2 z-20 rounded-full px-3 py-1 text-base font-semibold whitespace-nowrap shadow-card"
                style={{ background: moodGradient(mood), color: MOOD_INK }}
              >
                {bubbleCount?.[mood] !== undefined && (
                  <span
                    data-testid="mood-bubble-count"
                    className="mr-1.5 inline-flex min-w-5 justify-center rounded-full bg-white/70 px-1.5 tabular-nums"
                  >
                    {bubbleCount[mood]}
                  </span>
                )}
                {t(`mood.${mood}`)}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
