"use client";

import { cn } from "cn";
import { useTranslations } from "next-intl";
import { JOURNAL_CONTEXTS, JOURNAL_CONTEXT_LABEL_KEY, type JournalContext } from "@/types/journal-context";

const OPTIONS: JournalContext[] = [...JOURNAL_CONTEXTS];

/** RN-DI-05: opcional, un solo valor. */
export function ContextPicker({
  value,
  onChange,
}: {
  value?: JournalContext;
  onChange: (context: JournalContext | undefined) => void;
}) {
  const t = useTranslations();

  return (
    <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={t("journal.contextLabel")}>
      {OPTIONS.map((option) => {
        const active = value === option;
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(active ? undefined : option)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors duration-200",
              active
                ? "border-flow bg-flow text-white shadow-flow"
                : "border-border bg-muted text-muted-foreground hover:border-flow/50",
            )}
          >
            {t(JOURNAL_CONTEXT_LABEL_KEY[option])}
          </button>
        );
      })}
    </div>
  );
}
