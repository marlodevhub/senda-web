"use client";

import { useTranslations } from "next-intl";
import { BookOpen, Briefcase, Heart, House, PersonStanding, Sparkles, Users, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { JOURNAL_CONTEXTS, JOURNAL_CONTEXT_LABEL_KEY, type JournalContext } from "@/types/journal-context";

const OPTIONS: JournalContext[] = [...JOURNAL_CONTEXTS];

const ICONS: Record<JournalContext, { icon: LucideIcon; tone: string }> = {
  STUDIES: { icon: BookOpen, tone: "text-flow-ink bg-flow-tint" },
  FAMILY: { icon: House, tone: "text-root-ink bg-root-tint" },
  FRIENDS: { icon: Users, tone: "text-flow-ink bg-flow-tint" },
  PARTNER: { icon: Heart, tone: "text-bloom-ink bg-bloom-tint" },
  BODY: { icon: PersonStanding, tone: "text-root-ink bg-root-tint" },
  WORK: { icon: Briefcase, tone: "text-sprout-ink bg-sprout-tint" },
  OTHER: { icon: Sparkles, tone: "text-flow-ink bg-flow-tint" },
};

/**
 * RN-DI-05: un solo contexto, obligatorio. Solo íconos para que sea compacto;
 * cada uno lleva su nombre como etiqueta accesible y tooltip, y el elegido se
 * nombra debajo.
 */
export function ContextPicker({
  value,
  onChange,
}: {
  value?: JournalContext;
  onChange: (context: JournalContext) => void;
}) {
  const t = useTranslations();

  return (
    <div className="flex flex-col items-center gap-2 rounded-lg bg-card/80 px-3 py-3 shadow-card backdrop-blur">
      <div role="radiogroup" aria-label={t("journal.contextLabel")} className="flex w-full justify-between gap-1">
        {OPTIONS.map((option) => {
          const active = value === option;
          const { icon: Icon, tone } = ICONS[option];
          const label = t(JOURNAL_CONTEXT_LABEL_KEY[option]);
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={label}
              title={label}
              onClick={() => onChange(option)}
              className={cn(
                "flex size-10 items-center justify-center rounded-full transition-[scale,box-shadow] duration-200 ease-[cubic-bezier(.34,1.56,.64,1)] hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:size-12",
                tone,
                active && "scale-110 ring-2 ring-flow ring-offset-2 ring-offset-card",
                value !== undefined && !active && "saturate-50",
              )}
            >
              <Icon className="size-5" aria-hidden />
            </button>
          );
        })}
      </div>
      {/* El nombre del elegido; el lector de pantalla ya lo anuncia en el botón. */}
      {value && (
        <p aria-hidden className="text-base font-semibold text-foreground">
          {t(JOURNAL_CONTEXT_LABEL_KEY[value])}
        </p>
      )}
    </div>
  );
}
