"use client";

import { cn } from "@/lib/utils";
import { MoodFace, type Mood } from "@/components/icons/mood-face";

/**
 * Selector de ánimo de 5 caras. Lo usan CU-01 (Diario), CU-06 (check-in de
 * Inicio) y CU-04 (ánimo posterior a una reescritura) — ver
 * Senda/docs/casos-de-uso/{nucleo,acompanamiento}.md.
 */
export function MoodPicker({
  value,
  onChange,
  size = "default",
  className,
}: {
  value?: Mood;
  onChange: (mood: Mood) => void;
  size?: "default" | "compact";
  className?: string;
}) {
  const moods: Mood[] = [1, 2, 3, 4, 5];
  const faceSize = size === "compact" ? "size-7" : "size-9";
  const buttonSize = size === "compact" ? "size-8" : "size-10";

  return (
    <div
      role="radiogroup"
      aria-label="¿Cómo estás hoy?"
      className={cn(
        "flex items-center justify-between gap-1 rounded-lg bg-card px-2.5 py-3 shadow-card",
        className
      )}
    >
      {moods.map((mood) => {
        const active = value === mood;
        return (
          <button
            key={mood}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(mood)}
            className={cn(
              buttonSize,
              "flex items-center justify-center rounded-full border-2 border-transparent text-muted-foreground transition-transform duration-200 ease-[cubic-bezier(.34,1.56,.64,1)] hover:-translate-y-0.5 hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              active &&
                "animate-breathe border-bloom bg-bloom-tint text-bloom"
            )}
          >
            <MoodFace mood={mood} active={active} className={faceSize} />
          </button>
        );
      })}
    </div>
  );
}
