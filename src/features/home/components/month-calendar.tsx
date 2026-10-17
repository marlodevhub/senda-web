"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { es } from "react-day-picker/locale";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import type { HomeWeekDay } from "@/features/home/api/get-home";
import { cn } from "@/lib/utils";
import { formatLocalDate } from "@/lib/format/dates";

/** Una fecha AAAA-MM-DD (día de Lima) como fecha local, que es como la maneja el calendario. */
function toLocalDate(date: string): Date {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/**
 * CU-05 en escritorio: el calendario de shadcn (react-day-picker), compacto, de lunes a domingo, con los 28 días de
 * la senda marcados: escribiste (verde), solo marcaste tu ánimo (amarillo), hoy, sin registro y los que todavía no
 * llegan. Se navega libremente por los meses. Cada día de la senda se puede tocar para ver lo de ese día debajo
 * (`DayDetails`); el elegido va sólido con el color del logo. Los días fuera de la senda van sin marca. Sin rachas ni
 * porcentajes (regla de coherencia 6).
 */
export function MonthCalendar({
  days,
  today,
  selectedDay,
  onSelectDay,
}: {
  days: HomeWeekDay[];
  today: number;
  selectedDay: number;
  onSelectDay: (interventionDay: number) => void;
}) {
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
    selected: at((day) => day.interventionDay === selectedDay),
  };
  const journeyDayAt = (date: Date) => days.find((day) => sameDay(toLocalDate(day.date), date));
  const fullDate = (date: Date) => formatLocalDate(date, { weekday: "long", day: "numeric", month: "long" });
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
          // Liviano a propósito: color solo donde hubo algo (escribiste o marcaste tu ánimo) y el anillo de hoy; los
          // días sin registro, un gris suave, y los que vienen, solo el número.
          entry: "[&>*]:bg-sprout [&>*]:text-sprout-foreground",
          mood: "[&>*]:bg-checkin [&>*]:text-checkin-foreground",
          moodToday:
            "[&>*]:bg-checkin [&>*]:text-checkin-foreground [&>*]:ring-2 [&>*]:ring-bloom [&>*]:ring-offset-2 [&>*]:ring-offset-card",
          journeyToday: "[&>*]:font-semibold [&>*]:text-bloom-ink [&>*]:ring-2 [&>*]:ring-bloom [&>*]:ring-inset",
          empty: "[&>*]:bg-foreground/5 [&>*]:text-muted-foreground",
          upcoming: "[&>*]:text-foreground",
          // El día elegido, sólido con el color del logo (gana a los demás colores).
          selected: "[&>*]:!bg-(--prompt-red) [&>*]:!font-semibold [&>*]:!text-(--prompt-red-foreground) [&>*]:!ring-0",
        }}
        labels={{
          labelGridcell: (date) => statusOf(date),
          labelPrevious: () => t("home.monthPrev"),
          labelNext: () => t("home.monthNext"),
        }}
        className="w-full bg-transparent p-0 [--cell-size:--spacing(9)]"
        classNames={{
          root: "w-full",
          month_caption: "flex h-(--cell-size) w-full items-center justify-start",
          caption_label: "font-heading text-base font-bold text-foreground capitalize",
          nav: "absolute inset-x-0 top-0 flex w-full items-center justify-end gap-1",
          weekday: "flex-1 text-sm font-normal text-muted-foreground capitalize select-none",
          week: "mt-1.5 flex w-full",
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
          // Los días de la senda son botones que muestran lo de ese día debajo; los demás, solo el número.
          // eslint-disable-next-line @typescript-eslint/no-unused-vars -- modifiers no va al <td>.
          Day: ({ day, modifiers: _modifiers, className, children, ...props }) => {
            const journeyDay = journeyDayAt(day.date);
            const circle =
              "flex size-8 items-center justify-center rounded-full text-sm font-normal text-muted-foreground tabular-nums";
            return (
              <td {...props} className={cn("flex flex-1 items-center justify-center p-0", className)}>
                {children !== undefined &&
                  children !== false &&
                  (journeyDay ? (
                    <button
                      type="button"
                      aria-label={statusOf(day.date)}
                      aria-pressed={journeyDay.interventionDay === selectedDay}
                      onClick={() => onSelectDay(journeyDay.interventionDay)}
                      className={cn(
                        circle,
                        "touch-manipulation transition-transform select-none [-webkit-tap-highlight-color:transparent] hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-90",
                      )}
                    >
                      {day.date.getDate()}
                    </button>
                  ) : (
                    <span className={circle}>{children}</span>
                  ))}
              </td>
            );
          },
        }}
      />

      <ul className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
        <Legend swatch="bg-sprout" label={t("home.legendEntry")} />
        <Legend swatch="bg-checkin" label={t("home.legendMood")} />
        <Legend swatch="ring-2 ring-bloom" label={t("home.legendToday")} />
        <Legend swatch="bg-foreground/10" label={t("home.legendEmpty")} />
      </ul>
    </div>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <li className="flex items-center gap-2">
      <span aria-hidden className={cn("size-2.5 rounded-full", swatch)} />
      {label}
    </li>
  );
}
