"use client";

import { useTranslations } from "next-intl";
import { BookOpen, Briefcase, House, PersonStanding, Sparkles, Users, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { JOURNAL_CONTEXTS, JOURNAL_CONTEXT_LABEL_KEY, type JournalContext } from "@/types/journal-context";

const OPTIONS: JournalContext[] = [...JOURNAL_CONTEXTS];

const ICONS: Record<JournalContext, { icon: LucideIcon; tone: string }> = {
  STUDIES: { icon: BookOpen, tone: "text-flow-ink bg-flow-tint" },
  FAMILY: { icon: House, tone: "text-root-ink bg-root-tint" },
  FRIENDS_OR_PARTNER: { icon: Users, tone: "text-bloom-ink bg-bloom-tint" },
  BODY: { icon: PersonStanding, tone: "text-root-ink bg-root-tint" },
  WORK: { icon: Briefcase, tone: "text-sprout-ink bg-sprout-tint" },
  OTHER: { icon: Sparkles, tone: "text-flow-ink bg-flow-tint" },
};

/** RN-DI-05: opcional, un solo valor; tocar el elegido lo quita. */
export function ContextPicker({
  value,
  onChange,
}: {
  value?: JournalContext;
  onChange: (context: JournalContext | undefined) => void;
}) {
  const t = useTranslations();

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6" role="radiogroup" aria-label={t("journal.contextLabel")}>
      {OPTIONS.map((option) => {
        const active = value === option;
        const { icon: Icon, tone } = ICONS[option];
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(active ? undefined : option)}
            className={cn(
              // shadow-(--shadow-card) y no .shadow-card: la clase propia pisaría el anillo del elegido.
              "flex flex-col items-center gap-1.5 rounded-[1.25rem] px-2 py-3 text-base font-semibold text-foreground shadow-(--shadow-card) backdrop-blur transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-ring",
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
