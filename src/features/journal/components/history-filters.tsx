"use client";

import { useTranslations } from "next-intl";
import { CONTEXT_ICONS } from "@/features/journal/context-icons";
import { cn } from "@/lib/utils";
import { DIMENSIONS, DIMENSION_SHORT_KEY } from "@/lib/dimension-style";
import { INTERVENTION_WEEKS } from "@/lib/journey";
import type { Dimension } from "@/types/dimension";
import { JOURNAL_CONTEXTS, JOURNAL_CONTEXT_LABEL_KEY, type JournalContext } from "@/types/journal-context";

const WEEKS = Array.from({ length: INTERVENTION_WEEKS }, (_, i) => i + 1);

export type HistoryFilterValues = { week?: number; dimension?: Dimension; context?: JournalContext };

/** Un grupo de opciones: se elige una o ninguna (tocar la elegida la quita). */
function FilterGroup<T extends string | number>({
  label,
  options,
  value,
  onChange,
  renderOption,
  className,
}: {
  label: string;
  options: readonly T[];
  value: T | undefined;
  onChange: (value: T | undefined) => void;
  renderOption: (option: T) => React.ReactNode;
  className?: string;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-base font-semibold text-foreground">{label}</legend>
      <div className={cn("flex flex-wrap gap-2", className)}>
        {options.map((option) => {
          const active = value === option;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(active ? undefined : option)}
              className={cn(
                "flex items-center gap-2 rounded-full px-3 py-1.5 text-base transition-colors focus-visible:outline-2 focus-visible:outline-ring",
                active
                  ? "bg-flow-tint text-flow-ink ring-2 ring-flow"
                  : "bg-flow-tint/60 text-foreground hover:bg-muted",
              )}
            >
              {renderOption(option)}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/** CU-11 (RN-HI-02): filtros por semana, dimensión y contexto; se aplican al tocarlos. */
export function HistoryFilters({
  value,
  onChange,
}: {
  value: HistoryFilterValues;
  onChange: (value: HistoryFilterValues) => void;
}) {
  const t = useTranslations();

  return (
    <div className="flex flex-col gap-5">
      <FilterGroup
        label={t("history.filterWeekLabel")}
        options={WEEKS}
        value={value.week}
        onChange={(week) => onChange({ ...value, week })}
        renderOption={(week) => t("history.weekLabel", { week })}
      />
      <FilterGroup
        label={t("history.filterDimensionLabel")}
        options={DIMENSIONS}
        value={value.dimension}
        onChange={(dimension) => onChange({ ...value, dimension })}
        renderOption={(dimension) => t(DIMENSION_SHORT_KEY[dimension])}
      />
      <FilterGroup
        label={t("history.filterContextLabel")}
        options={JOURNAL_CONTEXTS}
        value={value.context}
        onChange={(context) => onChange({ ...value, context })}
        renderOption={(context) => {
          const Icon = CONTEXT_ICONS[context].icon;
          return (
            <>
              <Icon className="size-4" aria-hidden />
              {t(JOURNAL_CONTEXT_LABEL_KEY[context])}
            </>
          );
        }}
      />
    </div>
  );
}
