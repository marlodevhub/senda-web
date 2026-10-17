"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { GENDER_LABEL_KEY, GENDERS, type Gender } from "@/types/gender";

/** Hombre, Mujer u Otro como 3 botones de opción (bienvenida CU-17 y perfil CU-20). */
export function GenderPicker({
  labelledBy,
  value,
  onChange,
  invalid,
  onColor = false,
}: {
  labelledBy: string;
  value: Gender | undefined;
  onChange: (gender: Gender) => void;
  invalid?: boolean;
  /** Sobre un fondo de color (la bienvenida): los no elegidos van en blanco y el elegido lleva un borde blanco. */
  onColor?: boolean;
}) {
  const t = useTranslations();
  return (
    <div
      role="radiogroup"
      aria-labelledby={labelledBy}
      aria-invalid={invalid || undefined}
      className="grid grid-cols-3 gap-2"
    >
      {GENDERS.map((gender) => {
        const selected = value === gender;
        return (
          <button
            key={gender}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(gender)}
            className={cn(
              "min-h-12 touch-manipulation rounded-full px-3 text-base font-semibold transition-[transform,background-color,color] duration-150 select-none [-webkit-tap-highlight-color:transparent] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.97] motion-reduce:active:scale-100",
              // Elegido: sólido con el color del logo (cambia con el tema); el resto, tintado sin borde.
              selected
                ? cn("bg-(--prompt-red) text-(--prompt-red-foreground) shadow-sm", onColor && "ring-3 ring-white")
                : onColor
                  ? "bg-card text-foreground"
                  : "bg-foreground/7 text-foreground hover:bg-foreground/11",
            )}
          >
            {t(GENDER_LABEL_KEY[gender])}
          </button>
        );
      })}
    </div>
  );
}
