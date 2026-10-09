"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "cn";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { MoodFace, type Mood } from "@/components/icons/mood-face";
import { useHistory } from "@/features/journal/api/use-entries";
import { JOURNAL_CONTEXTS, JOURNAL_CONTEXT_LABEL_KEY, type JournalContext } from "@/types/journal-context";

const WEEKS = [1, 2, 3, 4] as const;
const DIMENSIONS = ["D1", "D2", "D3"] as const;
const DIMENSION_SHORT_KEY: Record<(typeof DIMENSIONS)[number], string> = {
  D1: "progress.dimensionShort.d1",
  D2: "progress.dimensionShort.d2",
  D3: "progress.dimensionShort.d3",
};

function FilterChips<T extends string | number>({
  label,
  options,
  value,
  optionLabel,
  onChange,
}: {
  label: string;
  options: readonly T[];
  value: T | undefined;
  optionLabel: (option: T) => string;
  onChange: (value: T | undefined) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => {
          const active = value === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(active ? undefined : option)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
                active
                  ? "border-flow bg-flow text-white shadow-flow"
                  : "border-border bg-muted text-muted-foreground hover:border-flow/50",
              )}
            >
              {optionLabel(option)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** CU-11: lista filtrable del historial, 20 por página con "Ver más" (RN-HI-01/02). */
export function EntryList() {
  const t = useTranslations();
  const [week, setWeek] = useState<number | undefined>();
  const [dimension, setDimension] = useState<string | undefined>();
  const [context, setContext] = useState<JournalContext | undefined>();

  const { data, isPending, hasNextPage, fetchNextPage, isFetchingNextPage } = useHistory({
    week,
    dimension,
    context,
  });
  const items = data?.pages.flatMap((p) => p.items) ?? [];
  const hasFilters = week !== undefined || dimension !== undefined || context !== undefined;

  function clearFilters() {
    setWeek(undefined);
    setDimension(undefined);
    setContext(undefined);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 rounded-xl bg-card p-3 shadow-card">
        <FilterChips
          label={t("history.filterWeekLabel")}
          options={WEEKS}
          value={week}
          optionLabel={(w) => t("history.weekLabel", { week: w })}
          onChange={setWeek}
        />
        <FilterChips
          label={t("history.filterDimensionLabel")}
          options={DIMENSIONS}
          value={dimension as (typeof DIMENSIONS)[number] | undefined}
          optionLabel={(d) => t(DIMENSION_SHORT_KEY[d])}
          onChange={setDimension}
        />
        <FilterChips
          label={t("history.filterContextLabel")}
          options={JOURNAL_CONTEXTS}
          value={context}
          optionLabel={(c) => t(JOURNAL_CONTEXT_LABEL_KEY[c])}
          onChange={setContext}
        />
        {hasFilters && (
          <Button variant="ghost" size="sm" className="self-start" onClick={clearFilters}>
            {t("history.clearFilters")}
          </Button>
        )}
      </div>

      {isPending && <p className="text-center text-sm text-muted-foreground">{t("common.loading")}</p>}

      {!isPending && items.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <p className="text-sm text-muted-foreground">
            {hasFilters ? t("history.noResults") : t("history.empty")}
          </p>
          {!hasFilters && (
            <Button variant="soft" asChild>
              <Link href="/diario">{t("history.writeCta")}</Link>
            </Button>
          )}
        </div>
      )}

      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              href={`/historial/${item.id}`}
              className="flex items-center gap-3 rounded-xl bg-card p-3 shadow-card transition-shadow hover:shadow-md"
            >
              <MoodFace mood={item.moodBefore as Mood} active className="size-9 shrink-0 text-flow" />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-sm font-semibold text-foreground">
                  {t("history.dayLabel", { day: item.interventionDay })}
                </span>
                <span className="text-xs text-muted-foreground">
                  {t("history.findingsCount", { count: item.findingsCount })}
                  {" · "}
                  {t("history.rewritesCount", { count: item.rewritesCount })}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {hasNextPage && (
        <Button variant="outline" disabled={isFetchingNextPage} onClick={() => fetchNextPage()}>
          {isFetchingNextPage ? t("common.loading") : t("history.loadMore")}
        </Button>
      )}
    </div>
  );
}
