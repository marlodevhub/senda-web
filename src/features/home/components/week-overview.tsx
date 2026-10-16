"use client";

import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import type { HomeWeekDay } from "@/features/home/api/get-home";
import { cn } from "@/lib/utils";

const INTERVENTION_DAYS = 28;
const WEEKS = 4;

/** Una fecha AAAA-MM-DD (día de Lima) formateada sin correrla por la zona del navegador. */
function formatDate(date: string, options: Intl.DateTimeFormatOptions): string {
  const [year, month, day] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("es-PE", { ...options, timeZone: "UTC" }).format(
    new Date(Date.UTC(year, month - 1, day)),
  );
}

/**
 * CU-05: la semana actual como calendario (días con registro, hoy y los que faltan) y tres datos que solo
 * describen: días con registro sobre la meta, día de la senda y semana. Sin rachas ni porcentajes (regla de
 * coherencia 6, RN-TR-04).
 */
export function WeekOverview({
  week,
  days,
  today,
  goal,
}: {
  week: number;
  days: HomeWeekDay[];
  today: number;
  goal: { daysWithEntry: number; goal: number } | null;
}) {
  const t = useTranslations();
  if (days.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="home-week" className="flex flex-col gap-4 rounded-lg bg-card p-5 shadow-card">
      <div className="flex items-baseline justify-between gap-2">
        <h2 id="home-week" className="font-heading text-lg font-bold text-foreground">
          {t("home.weekTitle", { week })}
        </h2>
        <p className="text-base text-muted-foreground">
          {t("home.weekRange", {
            from: formatDate(days[0].date, { day: "numeric", month: "short" }),
            to: formatDate(days[days.length - 1].date, { day: "numeric", month: "short" }),
          })}
        </p>
      </div>

      <ol className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const isToday = day.interventionDay === today;
          const isFuture = day.interventionDay > today;
          const fullDate = formatDate(day.date, { weekday: "long", day: "numeric", month: "long" });
          const status = day.hasEntry
            ? t("home.dayStatusEntry", { date: fullDate })
            : isToday
              ? t("home.dayStatusToday", { date: fullDate })
              : isFuture
                ? t("home.dayStatusFuture", { date: fullDate })
                : t("home.dayStatusEmpty", { date: fullDate });
          return (
            <li key={day.interventionDay} aria-label={status} className="flex flex-col items-center gap-1.5">
              <span aria-hidden className="text-base text-muted-foreground capitalize">
                {formatDate(day.date, { weekday: "narrow" })}
              </span>
              <span
                aria-hidden
                className={cn(
                  "flex size-10 items-center justify-center rounded-full text-base font-semibold tabular-nums transition-colors",
                  day.hasEntry && "bg-sprout text-sprout-foreground",
                  !day.hasEntry && isToday && "text-bloom-ink ring-2 ring-bloom",
                  !day.hasEntry && !isToday && !isFuture && "bg-muted text-muted-foreground",
                  !day.hasEntry && isFuture && "text-muted-foreground ring-1 ring-border",
                )}
              >
                {day.hasEntry ? <Check className="size-5" strokeWidth={3} /> : formatDate(day.date, { day: "numeric" })}
              </span>
            </li>
          );
        })}
      </ol>

      <dl className="grid grid-cols-3 divide-x divide-border border-t border-border pt-4 text-center">
        {goal && <Stat label={t("home.statDays")} value={goal.daysWithEntry} total={goal.goal} />}
        <Stat
          label={t("home.statJourney")}
          value={Math.min(Math.max(today, 1), INTERVENTION_DAYS)}
          total={INTERVENTION_DAYS}
        />
        <Stat label={t("home.statWeek")} value={week} total={WEEKS} />
      </dl>
    </section>
  );
}

function Stat({ label, value, total }: { label: string; value: number; total: number }) {
  const t = useTranslations();
  return (
    <div className="flex flex-col gap-0.5 px-1">
      <dt className="order-2 text-base text-muted-foreground">{label}</dt>
      <dd className="order-1 font-heading text-2xl font-bold text-foreground tabular-nums">
        {value} <span className="text-base font-normal text-muted-foreground">{t("home.statOf", { total })}</span>
      </dd>
    </div>
  );
}
