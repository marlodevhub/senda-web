"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { MoodOrb, type Mood } from "@/components/icons/mood-orb";

const MOODS: Mood[] = [1, 2, 3, 4, 5];

/**
 * Selector de ánimo de 5 caritas animadas. Lo usan CU-01 (Diario), CU-06
 * (check-in de Inicio) y CU-04 (ánimo posterior a una reescritura) — ver
 * Senda/docs/casos-de-uso/{nucleo,acompanamiento}.md. `label` es la pregunta
 * de cada pantalla, con la que se anuncia el grupo.
 */
export function MoodPicker({
  label,
  value,
  onChange,
  size = "default",
  className,
}: {
  label: string;
  value?: Mood;
  onChange: (mood: Mood) => void;
  size?: "default" | "compact";
  className?: string;
}) {
  const t = useTranslations();
  const orbSize = size === "compact" ? "size-10" : "size-12";

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn("flex items-start justify-between gap-1 rounded-lg bg-card px-3 pt-3 pb-2 shadow-card", className)}
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
            onClick={() => onChange(mood)}
            className="group flex flex-1 flex-col items-center gap-1 rounded-lg py-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {/* El salto al elegir va en este contenedor; el movimiento propio, en la carita. */}
            <span
              key={active ? "on" : "off"}
              className={cn(
                "inline-flex rounded-full transition-[scale,filter] duration-300 ease-[cubic-bezier(.34,1.56,.64,1)] group-hover:scale-110",
                active && "mood-pop scale-115 ring-4 ring-bloom-tint",
                // Sin transparencia: sobre el fondo oscuro quedaría turbia.
                value !== undefined && !active && "scale-90 saturate-50",
              )}
            >
              <MoodOrb mood={mood} animated decorative className={orbSize} />
            </span>
            {/* El nombre del ánimo elegido; el lector de pantalla ya lo anuncia en el botón. */}
            <span
              aria-hidden
              className={cn(
                "text-base font-semibold whitespace-nowrap text-foreground",
                // Sin ánimo elegido no se reserva el renglón; con uno, todos lo reservan para no saltar.
                value === undefined ? "hidden" : active ? "visible" : "invisible",
              )}
            >
              {t(`mood.${mood}`)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
