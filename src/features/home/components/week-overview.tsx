"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import type { HomeWeekDay } from "@/features/home/api/get-home";
import { DayDetails } from "@/features/home/components/day-details";
import { JourneyBanner } from "@/features/home/components/journey-banner";
import { MonthCalendar } from "@/features/home/components/month-calendar";
import { cn } from "@/lib/utils";
import { formatIsoDay } from "@/lib/format/dates";
import { clampJourneyDay } from "@/lib/journey";

/**
 * CU-05: la semana actual como calendario (días con registro, hoy y los que faltan) y, al pie, en qué va de su
 * senda (JourneyBanner: día, días con registro sobre la meta y semana; solo describen). En escritorio, en lugar de la semana va
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
  // Móvil y tablet: el mes completo (por defecto) o la semana. En escritorio siempre va el mes.
  const [view, setView] = useState<"week" | "month">("month");
  if (days.length === 0) {
    return null;
  }
  const selected =
    journeyDays.find((day) => day.interventionDay === selectedDay) ??
    days.find((day) => day.interventionDay === selectedDay);

  return (
    <section
      aria-labelledby="home-week"
      className="flex flex-col gap-4 rounded-lg bg-card p-5 shadow-(--shadow-card) lg:min-h-full lg:gap-3 lg:bg-transparent lg:shadow-none"
    >
      <div className="flex items-center justify-between gap-2 lg:sr-only">
        <div className="flex min-w-0 flex-col">
          <h2 id="home-week" className="font-heading text-lg font-bold text-foreground">
            {t("home.weekTitle", { week })}
          </h2>
          {view === "week" && (
            <p className="text-sm text-muted-foreground">
              {t("home.weekRange", {
                from: formatIsoDay(days[0].date, { day: "numeric", month: "short" }),
                to: formatIsoDay(days[days.length - 1].date, { day: "numeric", month: "short" }),
              })}
            </p>
          )}
        </div>
        {journeyDays.length > 0 && <ViewToggle value={view} onChange={setView} />}
      </div>

      {/*
        Escritorio: el calendario queda fijo arriba del panel y la tarjeta "Tu senda" fija abajo, los dos sobre vidrio
        desenfocado; las tarjetas del día se deslizan por debajo (sticky dentro del panel, que es el que se desplaza).
      */}
      {journeyDays.length > 0 && (
        <div
          className={cn(
            view === "month" ? "block" : "hidden lg:block",
            "lg:sticky lg:top-0 lg:z-10 lg:-mx-5 lg:-mt-5 lg:border-b lg:border-foreground/5 lg:bg-card/70 lg:px-5 lg:pt-5 lg:pb-3 lg:backdrop-blur-xl",
          )}
        >
          <MonthCalendar days={journeyDays} today={today} selectedDay={selectedDay} onSelectDay={setSelectedDay} />
        </div>
      )}

      <ol className={cn("grid-cols-7 gap-1 lg:hidden", view === "week" ? "grid" : "hidden")}>
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

      {/* Al pie: en qué va de su senda, en una tarjeta destacada (en escritorio, abajo del panel). */}
      <div className="lg:sticky lg:bottom-0 lg:z-10 lg:-mx-5 lg:-mb-5 lg:mt-auto lg:border-t lg:border-foreground/5 lg:bg-card/70 lg:px-5 lg:pt-3 lg:pb-5 lg:backdrop-blur-xl">
        <JourneyBanner today={today} week={week} goal={goal} />
      </div>
    </section>
  );
}

/** Semana | Mes, como un control segmentado: el elegido, sólido con el color del logo. */
function ViewToggle({ value, onChange }: { value: "week" | "month"; onChange: (view: "week" | "month") => void }) {
  const t = useTranslations();
  return (
    <div role="group" aria-label={t("home.calendarView")} className="flex shrink-0 rounded-full bg-foreground/7 p-1">
      {(["week", "month"] as const).map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={value === option}
          onClick={() => onChange(option)}
          className={cn(
            "min-h-9 touch-manipulation rounded-full px-3.5 text-sm font-semibold transition-colors select-none [-webkit-tap-highlight-color:transparent] focus-visible:outline-2 focus-visible:outline-ring",
            value === option ? "bg-(--prompt-red) text-(--prompt-red-foreground) shadow-sm" : "text-foreground",
          )}
        >
          {t(option === "week" ? "home.calendarWeek" : "home.calendarMonth")}
        </button>
      ))}
    </div>
  );
}
