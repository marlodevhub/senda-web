"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { HomeWeekDay } from "@/features/home/api/get-home";
import { cn } from "@/lib/utils";

type YearMonth = { year: number; month: number };

/** Un lunes cualquiera: de ahí salen las iniciales de la semana, de lunes a domingo. */
const A_MONDAY = Date.UTC(2024, 0, 1);
const DAY_MS = 24 * 60 * 60 * 1000;

function parse(date: string): YearMonth & { day: number } {
  const [year, month, day] = date.split("-").map(Number);
  return { year, month, day };
}

function isoDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function format(utcMs: number, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat("es-PE", { ...options, timeZone: "UTC" }).format(new Date(utcMs));
}

function monthIndex({ year, month }: YearMonth): number {
  return year * 12 + month - 1;
}

function fromIndex(index: number): YearMonth {
  return { year: Math.floor(index / 12), month: (index % 12) + 1 };
}

/**
 * CU-05 en escritorio: el mes completo, de lunes a domingo, con los 28 días de la senda marcados (escribiste,
 * hoy, sin registro, todavía no llega). Se navega por los meses que toca la senda; los días fuera de ella van sin
 * marca. Sin rachas ni porcentajes (regla de coherencia 6).
 */
export function MonthCalendar({ days, today }: { days: HomeWeekDay[]; today: number }) {
  const t = useTranslations();
  const byDate = new Map(days.map((day) => [day.date, day]));
  const first = monthIndex(parse(days[0].date));
  const last = monthIndex(parse(days[days.length - 1].date));
  const todayDay = days.find((day) => day.interventionDay === today) ?? (today < 1 ? days[0] : days[days.length - 1]);
  const [shown, setShown] = useState(() => monthIndex(parse(todayDay.date)));

  const { year, month } = fromIndex(shown);
  const firstOfMonth = Date.UTC(year, month - 1, 1);
  const leadingBlanks = (new Date(firstOfMonth).getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  const rows = Array.from({ length: cells.length / 7 }, (_, r) => cells.slice(r * 7, r * 7 + 7));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h3 aria-live="polite" className="font-heading text-lg font-bold text-foreground first-letter:uppercase">
          {format(firstOfMonth, { month: "long", year: "numeric" })}
        </h3>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("home.monthPrev")}
            disabled={shown <= first}
            onClick={() => setShown(shown - 1)}
          >
            <ChevronLeft className="size-5" aria-hidden />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("home.monthNext")}
            disabled={shown >= last}
            onClick={() => setShown(shown + 1)}
          >
            <ChevronRight className="size-5" aria-hidden />
          </Button>
        </div>
      </div>

      <table className="w-full table-fixed border-separate border-spacing-y-1 text-center">
        <thead>
          <tr>
            {Array.from({ length: 7 }, (_, i) => (
              <th
                key={i}
                scope="col"
                abbr={format(A_MONDAY + i * DAY_MS, { weekday: "long" })}
                className="pb-1 text-base font-normal text-muted-foreground capitalize"
              >
                {format(A_MONDAY + i * DAY_MS, { weekday: "narrow" })}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r}>
              {row.map((dayOfMonth, c) => {
                if (dayOfMonth === null) {
                  return <td key={c} />;
                }
                const journeyDay = byDate.get(isoDate(year, month, dayOfMonth));
                const fullDate = format(Date.UTC(year, month - 1, dayOfMonth), {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                });
                const isToday = journeyDay?.interventionDay === today;
                const isFuture = journeyDay !== undefined && journeyDay.interventionDay > today;
                const label = !journeyDay
                  ? undefined
                  : journeyDay.hasEntry
                    ? t("home.dayStatusEntry", { date: fullDate })
                    : isToday
                      ? t("home.dayStatusToday", { date: fullDate })
                      : isFuture
                        ? t("home.dayStatusFuture", { date: fullDate })
                        : t("home.dayStatusEmpty", { date: fullDate });
                return (
                  <td key={c} aria-label={label} aria-current={isToday ? "date" : undefined}>
                    <span
                      aria-hidden={label ? true : undefined}
                      className={cn(
                        "mx-auto flex size-10 items-center justify-center rounded-full text-base tabular-nums",
                        !journeyDay && "text-muted-foreground",
                        journeyDay?.hasEntry && "bg-sprout font-semibold text-sprout-foreground",
                        journeyDay &&
                          !journeyDay.hasEntry &&
                          isToday &&
                          "font-semibold text-bloom-ink ring-2 ring-bloom",
                        journeyDay &&
                          !journeyDay.hasEntry &&
                          !isToday &&
                          !isFuture &&
                          "bg-muted font-semibold text-muted-foreground",
                        journeyDay &&
                          !journeyDay.hasEntry &&
                          isFuture &&
                          "font-semibold text-foreground ring-1 ring-border",
                      )}
                    >
                      {dayOfMonth}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-base text-muted-foreground">
        <Legend swatch="bg-sprout" label={t("home.legendEntry")} />
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
