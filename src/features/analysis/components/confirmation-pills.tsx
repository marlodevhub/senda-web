"use client";

import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export type ConfirmationAnswer = "YES" | "PARTLY" | "NO";

const OPTIONS: {
  value: ConfirmationAnswer;
  labelKey: "analysis.confirmYes" | "analysis.confirmPartly" | "analysis.confirmNo";
}[] = [
  { value: "YES", labelKey: "analysis.confirmYes" },
  { value: "PARTLY", labelKey: "analysis.confirmPartly" },
  { value: "NO", labelKey: "analysis.confirmNo" },
];

/**
 * "¿Esto refleja lo que escribiste?" (CU-03, RN-ES-14). Opcional, se puede
 * cambiar; la elección NO afecta el análisis, solo retroalimenta al PLN.
 */
export function ConfirmationPills({
  value,
  onChange,
}: {
  value?: ConfirmationAnswer | null;
  onChange: (answer: ConfirmationAnswer) => void;
}) {
  const t = useTranslations();

  return (
    <div className="flex gap-1.5" role="radiogroup" aria-label={t("analysis.confirmationQuestion")}>
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
              "flex-1 rounded-full border px-2 py-2.5 text-base font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-ring",
              active
                ? "border-sprout bg-sprout text-sprout-foreground shadow-sprout"
                : "border-border bg-muted text-muted-foreground hover:border-sprout/50",
            )}
          >
            {t(opt.labelKey)}
          </button>
        );
      })}
    </div>
  );
}
