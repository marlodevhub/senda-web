"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import type { HomeWeekDay } from "@/features/home/api/get-home";
import { DayDetails } from "@/features/home/components/day-details";
import { MonthCalendar } from "@/features/home/components/month-calendar";
import { cn } from "@/lib/utils";
import { formatIsoDay } from "@/lib/format/dates";
import { clampJourneyDay, INTERVENTION_DAYS, INTERVENTION_WEEKS } from "@/lib/journey";

/**
 * CU-05: la semana actual como calendario (días con registro, hoy y los que faltan) y tres datos que solo
 * describen: días con registro sobre la meta, día de la senda y semana. En escritorio, en lugar de la semana va
 * el mes completo, navegable (MonthCalendar). Al tocar un día, lo de ese día sale debajo en tarjetas (DayDetails);
 * al abrir, el de hoy. Sin rachas ni porcentajes (regla de coherencia 6, RN-TR-04).
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
  const [selectedDay, setSelectedDay] = useState(clampJourneyDay(today));
  if (days.length === 0) {
    return null;
  }
  const selected =
    journeyDays.find((day) => day.interventionDay === selectedDay) ??
    days.find((day) => day.interventionDay === selectedDay);

  return (
    <section aria-labelledby="home-week" className="flex flex-col gap-4 rounded-lg bg-card p-5 shadow-(--shadow-card) lg:gap-3 lg:bg-transparent lg:shadow-none">
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
          <MonthCalendar days={journeyDays} today={today} selectedDay={selectedDay} onSelectDay={setSelectedDay} />
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
            <li key={day.interventionDay} className="flex flex-col items-center gap-1.5">
              <span aria-hidden className="text-sm text-muted-foreground capitalize">
                {formatIsoDay(day.date, { weekday: "narrow" })}
              </span>
              <button
                type="button"
                aria-label={status}
                aria-pressed={day.interventionDay === selectedDay}
                onClick={() => setSelectedDay(day.interventionDay)}
                className={cn(
                  "flex size-9 touch-manipulation items-center justify-center rounded-full text-sm tabular-nums transition-transform select-none [-webkit-tap-highlight-color:transparent] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-90",
                  day.hasEntry && "bg-sprout text-sprout-foreground",
                  moodOnly && "bg-checkin text-checkin-foreground",
                  moodOnly && isToday && "ring-2 ring-bloom ring-offset-2 ring-offset-card",
                  !day.hasEntry && !moodOnly && isToday && "font-semibold text-bloom-ink ring-2 ring-bloom",
                  !day.hasEntry && !moodOnly && !isToday && !isFuture && "bg-foreground/5 text-muted-foreground",
                  !day.hasEntry && isFuture && "text-foreground",
                  // El día elegido, sólido con el color del logo.
                  day.interventionDay === selectedDay &&
                    "bg-(--prompt-red) font-semibold text-(--prompt-red-foreground) ring-0 ring-offset-0",
                )}
              >
                {day.hasEntry ? (
                  <Check className="size-4" strokeWidth={3} aria-hidden />
                ) : (
                  formatIsoDay(day.date, { day: "numeric" })
                )}
              </button>
            </li>
          );
        })}
      </ol>

      {selected && <DayDetails day={selected} today={today} />}

      <dl className="grid grid-cols-3 divide-x divide-border border-t border-border pt-4 text-center lg:pt-3">
        {goal && <Stat label={t("home.statDays")} value={goal.daysWithEntry} total={goal.goal} />}
        <Stat label={t("home.statJourney")} value={clampJourneyDay(today)} total={INTERVENTION_DAYS} />
        <Stat label={t("home.statWeek")} value={week} total={INTERVENTION_WEEKS} />
      </dl>
    </section>
  );
}

function Stat({ label, value, total }: { label: string; value: number; total: number }) {
  const t = useTranslations();
  return (
    <div className="flex flex-col gap-0.5 px-1">
      <dt className="order-2 text-sm text-muted-foreground">{label}</dt>
      <dd className="order-1 font-heading text-xl font-bold text-foreground tabular-nums lg:text-lg">
        {value} <span className="text-sm font-normal text-muted-foreground">{t("home.statOf", { total })}</span>
      </dd>
    </div>
  );
}
