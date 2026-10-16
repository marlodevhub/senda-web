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
}: {
  labelledBy: string;
  value: Gender | undefined;
  onChange: (gender: Gender) => void;
  invalid?: boolean;
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
              "min-h-12 rounded-full border-2 px-3 text-base font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              selected
                ? "border-transparent bg-bloom-tint text-bloom-ink"
                : "border-border bg-card text-foreground hover:bg-muted",
            )}
          >
            {t(GENDER_LABEL_KEY[gender])}
          </button>
        );
      })}
    </div>
  );
}
