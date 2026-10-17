"use client";

import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import type { HomeWeekDay } from "@/features/home/api/get-home";
import { MonthCalendar } from "@/features/home/components/month-calendar";
import { cn } from "@/lib/utils";
import { formatIsoDay } from "@/lib/format/dates";
import { clampJourneyDay, INTERVENTION_DAYS, INTERVENTION_WEEKS } from "@/lib/journey";



/**
 * CU-05: la semana actual como calendario (días con registro, hoy y los que faltan) y tres datos que solo
 * describen: días con registro sobre la meta, día de la senda y semana. En escritorio, en lugar de la semana va
 * el mes completo, navegable (MonthCalendar). Sin rachas ni porcentajes (regla de coherencia 6, RN-TR-04).
 */
export function WeekOverview({
  week,
  days,
  journeyDays,
  today,
  goal,
}: {
  week: number;
  days: HomeWeekDay[];
  journeyDays: HomeWeekDay[];
  today: number;
  goal: { daysWithEntry: number; goal: number } | null;
}) {
  const t = useTranslations();
  if (days.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="home-week" className="flex flex-col gap-4 rounded-lg bg-card p-5 shadow-card lg:gap-3">
      <div className="flex items-baseline justify-between gap-2 lg:sr-only">
        <h2 id="home-week" className="font-heading text-lg font-bold text-foreground">
          {t("home.weekTitle", { week })}
        </h2>
        <p className="text-base text-muted-foreground">
          {t("home.weekRange", {
            from: formatIsoDay(days[0].date, { day: "numeric", month: "short" }),
            to: formatIsoDay(days[days.length - 1].date, { day: "numeric", month: "short" }),
          })}
        </p>
      </div>

      {journeyDays.length > 0 && (
        <div className="hidden lg:block">
          <MonthCalendar days={journeyDays} today={today} />
        </div>
      )}

      <ol className="grid grid-cols-7 gap-1 lg:hidden">
        {days.map((day) => {
          const isToday = day.interventionDay === today;
          const isFuture = day.interventionDay > today;
          const fullDate = formatIsoDay(day.date, { weekday: "long", day: "numeric", month: "long" });
          const moodOnly = !day.hasEntry && day.mood !== null;
          const status = day.hasEntry
            ? t("home.dayStatusEntry", { date: fullDate })
            : moodOnly
              ? t("home.dayStatusMood", { date: fullDate })
              : isToday
                ? t("home.dayStatusToday", { date: fullDate })
                : isFuture
                  ? t("home.dayStatusFuture", { date: fullDate })
                  : t("home.dayStatusEmpty", { date: fullDate });
          return (
            <li key={day.interventionDay} aria-label={status} className="flex flex-col items-center gap-1.5">
              <span aria-hidden className="text-base text-muted-foreground capitalize">
                {formatIsoDay(day.date, { weekday: "narrow" })}
              </span>
              <span
                aria-hidden
                className={cn(
                  "flex size-9 items-center justify-center rounded-full text-base tabular-nums transition-colors",
                  day.hasEntry && "bg-sprout text-sprout-foreground",
                  moodOnly && "bg-checkin text-checkin-foreground",
                  moodOnly && isToday && "ring-2 ring-bloom ring-offset-2 ring-offset-card",
                  !day.hasEntry && !moodOnly && isToday && "font-semibold text-bloom-ink ring-2 ring-bloom",
                  !day.hasEntry && !moodOnly && !isToday && !isFuture && "bg-foreground/5 text-muted-foreground",
                  !day.hasEntry && isFuture && "text-foreground",
                )}
              >
                {day.hasEntry ? <Check className="size-5" strokeWidth={3} /> : formatIsoDay(day.date, { day: "numeric" })}
              </span>
            </li>
          );
        })}
      </ol>

      <dl className="grid grid-cols-3 divide-x divide-border border-t border-border pt-4 text-center lg:pt-3">
        {goal && <Stat label={t("home.statDays")} value={goal.daysWithEntry} total={goal.goal} />}
        <Stat
          label={t("home.statJourney")}
          value={clampJourneyDay(today)}
          total={INTERVENTION_DAYS}
        />
        <Stat label={t("home.statWeek")} value={week} total={INTERVENTION_WEEKS} />
      </dl>
    </section>
  );
}

function Stat({ label, value, total }: { label: string; value: number; total: number }) {
  const t = useTranslations();
  return (
    <div className="flex flex-col gap-0.5 px-1">
      <dt className="order-2 text-base text-muted-foreground">{label}</dt>
      <dd className="order-1 font-heading text-2xl font-bold text-foreground tabular-nums lg:text-xl">
        {value} <span className="text-base font-normal text-muted-foreground">{t("home.statOf", { total })}</span>
      </dd>
    </div>
  );
}
