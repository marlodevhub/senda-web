"use client";

import { cn } from "cn";

export type ConfirmationAnswer = "YES" | "PARTLY" | "NO";

const OPTIONS: { value: ConfirmationAnswer; label: string }[] = [
  { value: "YES", label: "Sí" },
  { value: "PARTLY", label: "En parte" },
  { value: "NO", label: "No" },
];

/**
 * "¿Esto refleja lo que escribiste?" (CU-03, RN-ES-14). Opcional, se puede
 * cambiar; la elección NO afecta el análisis, solo retroalimenta al PLN.
 */
export function ConfirmationPills({
  value,
  onChange,
}: {
  value?: ConfirmationAnswer;
  onChange: (answer: ConfirmationAnswer) => void;
}) {
  return (
    <div className="flex gap-1.5" role="radiogroup" aria-label="¿Esto refleja lo que escribiste?">
      {OPTIONS.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex-1 rounded-full border px-2 py-2 text-xs font-bold transition-colors duration-200",
              active
                ? "border-sprout bg-sprout text-white shadow-sprout"
                : "border-border bg-muted text-muted-foreground hover:border-sprout/50"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
