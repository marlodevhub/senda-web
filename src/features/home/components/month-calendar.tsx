"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { es } from "react-day-picker/locale";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import type { HomeWeekDay } from "@/features/home/api/get-home";
import { cn } from "@/lib/utils";

/** Una fecha AAAA-MM-DD (día de Lima) como fecha local, que es como la maneja el calendario. */
function toLocalDate(date: string): Date {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/**
 * CU-05 en escritorio: el calendario de shadcn (react-day-picker), de lunes a domingo, con los 28 días de la
 * senda marcados: escribiste (verde), solo marcaste tu ánimo (amarillo), hoy, sin registro y los que todavía no llegan. Se navega libremente por los meses;
 * los días fuera de la senda van sin marca. Solo muestra: no se elige ningún día. Sin rachas ni porcentajes
 * (regla de coherencia 6).
 */
export function MonthCalendar({ days, today }: { days: HomeWeekDay[]; today: number }) {
  const t = useTranslations();
  const todayDay = days.find((day) => day.interventionDay === today);
  const todayDate = todayDay ? toLocalDate(todayDay.date) : undefined;
  // El mes se controla aquí para que "Hoy" pueda volver al mes actual desde cualquier otro.
  const homeMonth = todayDate ?? new Date();
  const [month, setMonth] = useState(homeMonth);
  const onHomeMonth = month.getFullYear() === homeMonth.getFullYear() && month.getMonth() === homeMonth.getMonth();
  const at = (predicate: (day: HomeWeekDay) => boolean) => days.filter(predicate).map((day) => toLocalDate(day.date));

  // Solo marcó su ánimo (check-in) ese día, sin registro.
  const moodOnly = (day: HomeWeekDay) => !day.hasEntry && day.mood !== null;
  const modifiers = {
    entry: at((day) => day.hasEntry),
    mood: at((day) => moodOnly(day) && day.interventionDay !== today),
    moodToday: at((day) => moodOnly(day) && day.interventionDay === today),
    empty: at((day) => !day.hasEntry && !moodOnly(day) && day.interventionDay < today),
    upcoming: at((day) => !day.hasEntry && day.interventionDay > today),
    journeyToday: at((day) => !day.hasEntry && !moodOnly(day) && day.interventionDay === today),
  };
  const fullDate = (date: Date) =>
    new Intl.DateTimeFormat("es-PE", { weekday: "long", day: "numeric", month: "long" }).format(date);
  const statusOf = (date: Date): string => {
    const has = (dates: Date[]) => dates.some((d) => sameDay(d, date));
    if (has(modifiers.entry)) return t("home.dayStatusEntry", { date: fullDate(date) });
    if (has(modifiers.mood) || has(modifiers.moodToday)) return t("home.dayStatusMood", { date: fullDate(date) });
    if (has(modifiers.journeyToday)) return t("home.dayStatusToday", { date: fullDate(date) });
    if (has(modifiers.empty)) return t("home.dayStatusEmpty", { date: fullDate(date) });
    if (has(modifiers.upcoming)) return t("home.dayStatusFuture", { date: fullDate(date) });
    return fullDate(date);
  };

  return (
    <div className="flex flex-col gap-3 lg:gap-2">
      <Calendar
        locale={es}
        weekStartsOn={1}
        today={todayDate}
        month={month}
        onMonthChange={setMonth}
        showOutsideDays={false}
        modifiers={modifiers}
        modifiersClassNames={{
          entry: "[&>*]:bg-sprout [&>*]:font-semibold [&>*]:text-sprout-foreground",
          mood: "[&>*]:bg-checkin [&>*]:font-semibold [&>*]:text-checkin-foreground",
          moodToday:
            "[&>*]:bg-checkin [&>*]:font-semibold [&>*]:text-checkin-foreground [&>*]:ring-2 [&>*]:ring-bloom [&>*]:ring-offset-2 [&>*]:ring-offset-card",
          journeyToday: "[&>*]:font-semibold [&>*]:text-bloom-ink [&>*]:ring-2 [&>*]:ring-bloom [&>*]:ring-inset",
          empty: "[&>*]:bg-muted [&>*]:font-semibold [&>*]:text-muted-foreground",
          upcoming: "[&>*]:font-semibold [&>*]:text-foreground [&>*]:ring-1 [&>*]:ring-border [&>*]:ring-inset",
        }}
        labels={{
          labelGridcell: (date) => statusOf(date),
          labelPrevious: () => t("home.monthPrev"),
          labelNext: () => t("home.monthNext"),
        }}
        className="w-full bg-transparent p-0 [--cell-size:--spacing(11)] lg:[--cell-size:--spacing(9)]"
        classNames={{
          root: "w-full",
          month_caption: "flex h-(--cell-size) w-full items-center justify-start",
          caption_label: "font-heading text-lg font-bold text-foreground capitalize lg:text-base",
          nav: "absolute inset-x-0 top-0 flex w-full items-center justify-end gap-1",
          weekday: "flex-1 text-base font-normal text-muted-foreground capitalize select-none",
          week: "mt-1.5 flex w-full lg:mt-1",
          day: "flex flex-1 items-center justify-center p-0 text-center select-none",
          today: "",
          outside: "",
        }}
        components={{
          // ‹ Hoy ›: "Hoy" vuelve al mes de hoy desde cualquier mes (desactivado si ya se está en él).
          Nav: ({ onPreviousClick, onNextClick, previousMonth, nextMonth, className }) => (
            <nav className={cn(className, "items-center")}>
              <Button
                variant="ghost"
                size="icon"
                aria-label={t("home.monthPrev")}
                disabled={!previousMonth}
                onClick={onPreviousClick}
              >
                <ChevronLeft className="size-5" aria-hidden />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full px-3 text-base"
                disabled={onHomeMonth}
                onClick={() => setMonth(homeMonth)}
              >
                {t("home.monthToday")}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label={t("home.monthNext")}
                disabled={!nextMonth}
                onClick={onNextClick}
              >
                <ChevronRight className="size-5" aria-hidden />
              </Button>
            </nav>
          ),
          // Solo muestra (sin selección): el día es una celda con un círculo y su número, no un botón.
          // eslint-disable-next-line @typescript-eslint/no-unused-vars -- day y modifiers no van al <td>.
          Day: ({ day: _day, modifiers: _modifiers, className, children, ...props }) => (
            <td {...props} className={cn("flex flex-1 items-center justify-center p-0", className)}>
              {children !== undefined && children !== false && (
                <span className="flex size-10 items-center justify-center rounded-full text-base text-muted-foreground tabular-nums lg:size-9">
                  {children}
                </span>
              )}
            </td>
          ),
        }}
      />

      <ul className="flex flex-wrap gap-x-3 gap-y-1 text-base text-muted-foreground">
        <Legend swatch="bg-sprout" label={t("home.legendEntry")} />
        <Legend swatch="bg-checkin" label={t("home.legendMood")} />
        <Legend swatch="ring-2 ring-bloom" label={t("home.legendToday")} />
        <Legend swatch="bg-muted ring-1 ring-border" label={t("home.legendEmpty")} />
      </ul>
    </div>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <li className="flex items-center gap-2">
      <span aria-hidden className={cn("size-3 rounded-full", swatch)} />
      {label}
    </li>
  );
}
