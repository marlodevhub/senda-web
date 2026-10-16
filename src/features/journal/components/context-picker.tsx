"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { JOURNAL_CONTEXTS, JOURNAL_CONTEXT_LABEL_KEY, type JournalContext } from "@/types/journal-context";
import { CONTEXT_ICONS } from "@/features/journal/context-icons";

const OPTIONS: JournalContext[] = [...JOURNAL_CONTEXTS];

/** RN-DI-05: obligatorio, un solo valor. */
export function ContextPicker({
  value,
  onChange,
}: {
  value?: JournalContext;
  onChange: (context: JournalContext) => void;
}) {
  const t = useTranslations();

  return (
    // 7 opciones: 4 + 3 centradas en móvil, todas en una fila desde sm.
    <div className="flex flex-wrap justify-center gap-2" role="radiogroup" aria-label={t("journal.contextLabel")}>
      {OPTIONS.map((option) => {
        const active = value === option;
        const { icon: Icon, tone } = CONTEXT_ICONS[option];
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option)}
            className={cn(
              // shadow-(--shadow-card) y no .shadow-card: la clase propia pisaría el anillo del elegido.
              "flex w-[calc((100%-1.5rem)/4)] flex-col items-center gap-1.5 rounded-[1.25rem] px-1 py-3 sm:w-[calc((100%-3rem)/7)] text-base text-foreground shadow-(--shadow-card) backdrop-blur transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-ring",
              active ? "bg-flow-tint ring-2 ring-flow" : "bg-card/80",
            )}
          >
            <span className={cn("flex size-9 items-center justify-center rounded-full", tone)}>
              <Icon className="size-5" aria-hidden />
            </span>
            <span className="text-center leading-tight">{t(JOURNAL_CONTEXT_LABEL_KEY[option])}</span>
          </button>
        );
      })}
    </div>
  );
}
