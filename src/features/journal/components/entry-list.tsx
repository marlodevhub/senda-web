"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ChevronRight, Feather, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { MoodOrb, type Mood } from "@/components/icons/mood-orb";
import { useHistory } from "@/features/journal/api/use-entries";
import type { JournalEntrySummary } from "@/features/journal/api/get-entries";
import {
  DIMENSION_SHORT_KEY,
  HistoryFilters,
  type HistoryFilterValues,
} from "@/features/journal/components/history-filters";
import { CONTEXT_ICONS } from "@/features/journal/context-icons";
import { cn } from "@/lib/utils";
import { JOURNAL_CONTEXT_LABEL_KEY } from "@/types/journal-context";

/** La fecha del registro (AAAA-MM-DD, día de Lima) como "jue 15 oct", sin correrla por la zona del navegador. */
function formatEntryDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("es-PE", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }).format(
    new Date(Date.UTC(year, month - 1, day)),
  );
}

/** Agrupa los registros por semana, en el orden en que llegan (del más reciente al más antiguo). */
function groupByWeek(items: JournalEntrySummary[]): { week: number; items: JournalEntrySummary[] }[] {
  const groups: { week: number; items: JournalEntrySummary[] }[] = [];
  for (const item of items) {
    const last = groups.at(-1);
    if (last?.week === item.week) {
      last.items.push(item);
    } else {
      groups.push({ week: item.week, items: [item] });
    }
  }
  return groups;
}

/**
 * CU-11: historial filtrable, 20 por página con "Ver más" (RN-HI-01/02). Con `view`, solo los registros con frases
 * por reescribir ("Por reescribir") o con reescrituras ("Reescritos"); cada registro dice cuántas le faltan.
 * Tablet y escritorio: la lista y, al costado, el panel de filtros fijo.
 * Móvil: los filtros en un drawer y los activos como chips que se quitan.
 */
/** Qué registros lista: todos, los que tienen frases por reescribir o los que ya tienen reescrituras. */
export type EntryListView = "all" | "pending" | "rewritten";

const EMPTY_KEY: Record<EntryListView, string> = {
  all: "history.empty",
  pending: "history.noPending",
  rewritten: "history.noRewritten",
};

export function EntryList({ view = "all" }: { view?: EntryListView }) {
  const t = useTranslations();
  const [filters, setFilters] = useState<HistoryFilterValues>({});

  const { data, isPending, hasNextPage, fetchNextPage, isFetchingNextPage } = useHistory({
    ...filters,
    pending: view === "pending",
    rewritten: view === "rewritten",
  });
  const items = data?.pages.flatMap((p) => p.items) ?? [];
  const activeCount = [filters.week, filters.dimension, filters.context].filter((v) => v !== undefined).length;
  const hasFilters = activeCount > 0;

  const activeChips = [
    filters.week !== undefined && {
      key: "week",
      label: t("history.weekLabel", { week: filters.week }),
      clear: () => setFilters({ ...filters, week: undefined }),
    },
    filters.dimension !== undefined && {
      key: "dimension",
      label: t(DIMENSION_SHORT_KEY[filters.dimension]),
      clear: () => setFilters({ ...filters, dimension: undefined }),
    },
    filters.context !== undefined && {
      key: "context",
      label: t(JOURNAL_CONTEXT_LABEL_KEY[filters.context]),
      clear: () => setFilters({ ...filters, context: undefined }),
    },
  ].filter((chip) => chip !== false);

  return (
    <div className="flex flex-col gap-5 md:grid md:grid-cols-[minmax(0,1fr)_15rem] md:items-start md:gap-6 lg:grid-cols-[minmax(0,1fr)_17rem]">
      {/* Móvil: botón de filtros y los activos. */}
      <div className="flex flex-wrap items-center gap-2 md:hidden">
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="outline" className="rounded-full">
              <SlidersHorizontal className="size-4" aria-hidden />
              {t("history.filtersButton", { count: activeCount })}
            </Button>
          </DrawerTrigger>
          <DrawerContent className="max-h-[85vh]">
            <DrawerHeader className="flex-row items-center justify-between text-left">
              <DrawerTitle className="text-xl font-bold">{t("history.filtersTitle")}</DrawerTitle>
              {hasFilters && (
                <Button variant="ghost" onClick={() => setFilters({})}>
                  {t("history.clearFilters")}
                </Button>
              )}
            </DrawerHeader>
            <div className="overflow-y-auto px-4 pb-2">
              <HistoryFilters value={filters} onChange={setFilters} />
            </div>
            <div className="p-4">
              <DrawerClose asChild>
                <Button variant="hero" size="xl" className="w-full rounded-full">
                  {t("history.filtersDone")}
                </Button>
              </DrawerClose>
            </div>
          </DrawerContent>
        </Drawer>
        {activeChips.map((chip) => (
          <button
            key={chip.key}
            type="button"
            onClick={chip.clear}
            aria-label={t("history.removeFilter", { name: chip.label })}
            className="flex items-center gap-1.5 rounded-full bg-flow-tint px-3 py-1.5 text-base text-flow-ink focus-visible:outline-2 focus-visible:outline-ring"
          >
            {chip.label}
            <X className="size-4" aria-hidden />
          </button>
        ))}
      </div>

      {/* Tablet y escritorio: el panel al costado, fijo al bajar. */}
      <aside
        aria-label={t("history.filtersTitle")}
        className="hidden rounded-lg bg-card p-5 shadow-card md:sticky md:top-8 md:order-2 md:block"
      >
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-foreground">
            <SlidersHorizontal className="size-4" aria-hidden />
            {t("history.filtersTitle")}
          </h2>
          {hasFilters && (
            <Button variant="ghost" size="sm" className="text-base" onClick={() => setFilters({})}>
              {t("history.clearFilters")}
            </Button>
          )}
        </div>
        <HistoryFilters value={filters} onChange={setFilters} />
      </aside>

      <section aria-label={t("history.title")} className="flex flex-col gap-5 md:order-1">
        {isPending && <p className="text-center text-base text-muted-foreground">{t("common.loading")}</p>}

        {!isPending && items.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-lg bg-card px-6 py-12 text-center shadow-card">
            <p className="text-base text-muted-foreground">
              {hasFilters ? t("history.noResults") : t(EMPTY_KEY[view])}
            </p>
            {hasFilters ? (
              <Button variant="outline" onClick={() => setFilters({})}>
                {t("history.clearFilters")}
              </Button>
            ) : (
              view === "all" && (
                <Button variant="hero" className="rounded-full" asChild>
                  <Link href="/diario">{t("history.writeCta")}</Link>
                </Button>
              )
            )}
          </div>
        )}

        {groupByWeek(items).map((group) => (
          <section key={group.week} aria-labelledby={`history-week-${group.week}`} className="flex flex-col gap-2">
            <h2 id={`history-week-${group.week}`} className="px-1 text-base font-semibold text-muted-foreground">
              {t("history.weekLabel", { week: group.week })}
            </h2>
            <ul className="flex flex-col gap-2">
              {group.items.map((item) => (
                <li key={item.id}>
                  <EntryRow item={item} />
                </li>
              ))}
            </ul>
          </section>
        ))}

        {hasNextPage && (
          <Button variant="outline" disabled={isFetchingNextPage} onClick={() => fetchNextPage()}>
            {isFetchingNextPage ? t("common.loading") : t("history.loadMore")}
          </Button>
        )}
      </section>
    </div>
  );
}

function EntryRow({ item }: { item: JournalEntrySummary }) {
  const t = useTranslations();
  const context = item.context ? CONTEXT_ICONS[item.context] : null;

  return (
    <Link
      href={`/historial/${item.id}`}
      className="group flex items-center gap-4 rounded-lg bg-card p-4 shadow-card transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-ring"
    >
      <MoodOrb mood={item.moodBefore as Mood} className="size-11" />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <p className="flex flex-wrap items-baseline gap-x-2">
          <span className="font-heading text-lg font-bold text-foreground">
            {t("history.dayLabel", { day: item.interventionDay })}
          </span>
          <span className="text-base text-muted-foreground">{formatEntryDate(item.date)}</span>
        </p>
        <div className="flex flex-wrap gap-1.5">
          {item.context && context && (
            <Tag className={context.tone}>
              <context.icon className="size-3.5" aria-hidden />
              {t(JOURNAL_CONTEXT_LABEL_KEY[item.context])}
            </Tag>
          )}
          <Tag className="bg-muted text-muted-foreground">
            {t("history.findingsCount", { count: item.findingsCount })}
          </Tag>
          {item.pendingCount > 0 && (
            <Tag className="bg-celeste text-foreground">
              <Feather className="size-3.5" aria-hidden />
              {t("history.pendingCount", { count: item.pendingCount })}
            </Tag>
          )}
          {item.rewritesCount > 0 && (
            <Tag className="bg-sprout-tint text-sprout-ink">
              {t("history.rewritesCount", { count: item.rewritesCount })}
            </Tag>
          )}
        </div>
      </div>
      <ChevronRight
        className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
        aria-hidden
      />
    </Link>
  );
}

function Tag({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-base", className)}>
      {children}
    </span>
  );
}
