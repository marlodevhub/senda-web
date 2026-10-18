"use client";

import { useTranslations } from "next-intl";
import { moodColor, type Mood } from "@/components/icons/mood-orb";
import type { DayPart, MoodDayPartPoint } from "@/features/progress/api/get-stats";

const DAY_PARTS: DayPart[] = ["EARLY_MORNING", "MORNING", "AFTERNOON", "NIGHT"];
const MOODS: Mood[] = [1, 2, 3, 4, 5];
/** Para nombrar la franja más liviana hacen falta al menos 2 franjas con al menos 2 ánimos cada una. */
const MIN_MARKS_PER_PART = 2;

function toMood(average: number): Mood {
  return Math.min(5, Math.max(1, Math.round(average))) as Mood;
}

/**
 * La franja con el promedio más alto, si hay datos suficientes y no hay empate. Describe sin calificar (regla de
 * coherencia 2): nombra los momentos más livianos, nunca los más pesados.
 */
export function lightestDayPart(data: MoodDayPartPoint[]): DayPart | null {
  const totals = new Map<DayPart, { sum: number; marks: number }>();
  for (const point of data) {
    const total = totals.get(point.dayPart) ?? { sum: 0, marks: 0 };
    total.sum += point.averageMood * point.marks;
    total.marks += point.marks;
    totals.set(point.dayPart, total);
  }
  const averages = [...totals.entries()]
    .filter(([, total]) => total.marks >= MIN_MARKS_PER_PART)
    .map(([part, total]) => ({ part, average: total.sum / total.marks }))
    .sort((a, b) => b.average - a.average);
  if (averages.length < 2 || averages[0].average - averages[1].average < 0.01) {
    return null;
  }
  return averages[0].part;
}

/**
 * "Mi día" (RN-PR-06): un mapa de calor con una fila por día de la senda (del más reciente al primero) y una columna
 * por franja del día; cada celda lleva el color de la carita de su promedio, o gris si no hubo ánimo. Es una tabla:
 * el lector de pantalla lee el ánimo de cada celda, el color no es lo único que lo dice.
 */
export function DayPartChart({ data }: { data: MoodDayPartPoint[] }) {
  const t = useTranslations();
  const byCell = new Map(data.map((point) => [`${point.interventionDay}-${point.dayPart}`, point]));
  const lastDay = Math.max(0, ...data.map((point) => point.interventionDay));
  const days = Array.from({ length: lastDay }, (_, index) => lastDay - index);
  const lightest = lightestDayPart(data);

  return (
    <div className="flex flex-col gap-3">
      {lightest && (
        <p className="text-sm text-foreground">
          {t("progress.stats.dayPartLightest", { part: t(`progress.stats.dayPartPlural.${lightest}`) })}
        </p>
      )}
      <div className="max-h-80 overflow-y-auto">
        <table className="w-full border-separate border-spacing-1 text-sm">
          <caption className="sr-only">{t("progress.stats.dayPartTitle")}</caption>
          <thead className="sticky top-0 bg-card">
            <tr>
              <th scope="col" className="w-14 text-left font-normal text-muted-foreground">
                {t("progress.stats.dayPartDay")}
              </th>
              {DAY_PARTS.map((part) => (
                <th key={part} scope="col" className="font-normal text-muted-foreground">
                  {t(`progress.stats.dayPart.${part}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map((day) => (
              <tr key={day}>
                <th scope="row" className="text-left font-normal text-muted-foreground tabular-nums">
                  {day}
                </th>
                {DAY_PARTS.map((part) => {
                  const point = byCell.get(`${day}-${part}`);
                  const label = point ? t(`mood.${toMood(point.averageMood)}`) : t("progress.stats.dayPartEmpty");
                  return (
                    <td key={part} className="p-0">
                      <span
                        title={t("progress.stats.dayPartCell", {
                          day,
                          part: t(`progress.stats.dayPart.${part}`),
                          mood: label,
                        })}
                        className="block h-6 rounded-md bg-foreground/[0.06]"
                        style={point ? { backgroundColor: moodColor(toMood(point.averageMood)) } : undefined}
                      >
                        <span className="sr-only">{label}</span>
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Leyenda: el color de cada carita con su nombre. */}
      <ul className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground" aria-hidden>
        {MOODS.map((mood) => (
          <li key={mood} className="flex items-center gap-1.5">
            <span className="size-3 rounded-full" style={{ backgroundColor: moodColor(mood) }} />
            {t(`mood.${mood}`)}
          </li>
        ))}
      </ul>
    </div>
  );
}
