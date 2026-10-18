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
  selectedColor,
}: {
  labelledBy: string;
  value: Gender | undefined;
  onChange: (gender: Gender) => void;
  invalid?: boolean;
  /**
   * Sobre un fondo de color (la bienvenida): todos sólidos y con la forma de los campos; los no elegidos en blanco y
   * el elegido en `selectedColor` (el color de la pantalla) con letra blanca.
   */
  onColor?: boolean;
  selectedColor?: string;
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
            style={selected && onColor && selectedColor ? { backgroundColor: selectedColor } : undefined}
            className={cn(
              "min-h-12 touch-manipulation px-3 text-base font-semibold transition-[transform,background-color,color] duration-150 select-none [-webkit-tap-highlight-color:transparent] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.97] motion-reduce:active:scale-100",
              // Sobre color: como los campos (esquinas de 1rem), sólidos y del mismo alto.
              onColor ? "rounded-2xl" : "rounded-full",
              // Elegido: sólido con el color del logo (o el de la pantalla, sobre color); el resto, tintado sin borde.
              selected
                ? onColor
                  ? "text-white shadow-sm ring-2 ring-white"
                  : "bg-(--prompt-red) text-(--prompt-red-foreground) shadow-sm"
                : onColor
                  ? "bg-white text-[#1D1D1F]"
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
