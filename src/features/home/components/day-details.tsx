"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ChevronRight, Feather, Loader2 } from "lucide-react";
import { MoodOrb } from "@/components/icons/mood-orb";
import type { HomeWeekDay } from "@/features/home/api/get-home";
import { useWeekEntries } from "@/features/home/api/use-week-entries";
import { formatIsoDay } from "@/lib/format/dates";
import { numberEntriesByDay, weekOfDay } from "@/lib/journey";
import { routes } from "@/lib/routes";
import { JOURNAL_CONTEXT_LABEL_KEY } from "@/types/journal-context";

/**
 * CU-05: lo del día que se tocó en el calendario, en tarjetas debajo de él. Si escribió, cada registro con su ánimo,
 * contexto y cuántas frases tuvo, reescribió o le faltan (sin ningún texto), con acceso al registro y a reescribir;
 * si solo marcó su ánimo, esa carita. Un día sin nada se dice sin reproche (regla de coherencia 6).
 */
export function DayDetails({ day, today }: { day: HomeWeekDay; today: number }) {
  const t = useTranslations();
  const isFuture = day.interventionDay > today;
  const { data: entries, isPending } = useWeekEntries(weekOfDay(day.interventionDay), day.hasEntry);
  const dayEntries = (entries ?? []).filter((entry) => entry.interventionDay === day.interventionDay);
  const numbers = numberEntriesByDay(dayEntries);

  return (
    <section aria-labelledby="day-details" aria-live="polite" className="flex flex-col gap-2.5">
      <h3 id="day-details" className="text-sm font-semibold text-muted-foreground first-letter:uppercase">
        {formatIsoDay(day.date, { weekday: "long", day: "numeric", month: "long" })}
      </h3>

      {day.hasEntry ? (
        isPending ? (
          <Loader2 className="size-5 animate-spin text-muted-foreground" aria-label={t("common.loading")} />
        ) : (
          dayEntries.map((entry) => (
            <article key={entry.id} className="flex flex-col gap-3 rounded-2xl bg-celeste p-3.5">
              <div className="flex items-center gap-3">
                <MoodOrb mood={entry.moodBefore} className="size-9" />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="font-semibold text-foreground">
                    {t("home.dayEntryTitle", { number: numbers.get(entry.id) ?? 1 })}
                  </span>
                  <span className="truncate text-sm text-muted-foreground">
                    {[
                      entry.context && t(JOURNAL_CONTEXT_LABEL_KEY[entry.context]),
                      t(entry.mode === "GUIDED" ? "journal.modeGuided" : "journal.modeFree"),
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </div>
              </div>
              <p className="text-sm text-foreground">
                {t("home.dayEntryFindings", { count: entry.findingsCount })}
                {entry.rewritesCount > 0 && ` · ${t("home.dayEntryRewrites", { count: entry.rewritesCount })}`}
              </p>
              <div className="flex gap-2">
                <Link
                  href={routes.entry(entry.id)}
                  className="inline-flex h-9 flex-1 items-center justify-center gap-1 rounded-full bg-card text-sm font-semibold text-foreground transition-transform active:scale-[0.97]"
                >
                  {t("home.dayEntryOpen")}
                  <ChevronRight className="size-4" aria-hidden />
                </Link>
                {entry.pendingCount > 0 && (
                  <Link
                    href={routes.rewrite(entry.id)}
                    className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full bg-(--prompt-red) text-sm font-semibold text-(--prompt-red-foreground) transition-transform active:scale-[0.97]"
                  >
                    <Feather className="size-4" aria-hidden />
                    {t("home.dayEntryRewrite", { count: entry.pendingCount })}
                  </Link>
                )}
              </div>
            </article>
          ))
        )
      ) : day.mood !== null ? (
        <article className="flex items-center gap-3 rounded-2xl bg-checkin/25 p-3.5">
          <MoodOrb mood={day.mood} decorative className="size-9" />
          <div className="flex flex-col">
            <span className="font-semibold text-foreground">{t("home.dayMoodTitle")}</span>
            <span className="text-sm text-muted-foreground">{t(`mood.${day.mood}`)}</span>
          </div>
        </article>
      ) : (
        <p className="rounded-2xl bg-foreground/5 p-3.5 text-sm text-muted-foreground">
          {t(isFuture ? "home.dayUpcoming" : day.interventionDay === today ? "home.dayTodayEmpty" : "home.dayNothing")}
        </p>
      )}
    </section>
  );
}
