"use client";

import { useTranslations } from "next-intl";
import { MoodOrb, type Mood } from "@/components/icons/mood-orb";
import type { HomeWeekDay } from "@/features/home/api/get-home";

const WIDTH = 280;
const HEIGHT = 90;
const PAD = 14;
const COLUMNS = 7;

/**
 * El ánimo de cada día de la semana (check-in o registro), como una línea suave con la carita de cada día.
 * Describe, no califica: sin promedios ni etiquetas de "buena semana" (regla de coherencia 2).
 */
export function MoodWeek({ days }: { days: HomeWeekDay[] }) {
  const t = useTranslations();
  const marked = days.flatMap((day, index) => (day.mood === null ? [] : [{ index, mood: day.mood }]));
  // Cada día en el centro de su columna: la misma grilla de 7 que las caritas de abajo.
  const x = (index: number) => ((index + 0.5) * WIDTH) / COLUMNS;
  const y = (mood: number) => HEIGHT - PAD - ((mood - 1) * (HEIGHT - PAD * 2)) / 4;
  const path = marked.map((p, i) => `${i === 0 ? "M" : "L"}${x(p.index)} ${y(p.mood)}`).join(" ");

  return (
    <section
      aria-labelledby="home-mood-week"
      className="flex flex-col gap-3 rounded-lg bg-card p-5 shadow-card fit:justify-center fit:p-4"
    >
      <h2 id="home-mood-week" className="font-heading text-lg font-bold text-foreground fit:text-base">
        {t("home.moodWeekTitle")}
      </h2>
      {marked.length === 0 ? (
        <p className="flex flex-1 items-center text-base text-muted-foreground">{t("home.moodWeekEmpty")}</p>
      ) : (
        <>
          {/* Sin scroll (`fit`): solo las caras de la semana, sin la línea. */}
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-auto w-full fit:hidden" aria-hidden>
            <path d={`M${x(0)} ${HEIGHT - PAD} H${x(COLUMNS - 1)}`} stroke="var(--border)" strokeDasharray="3 5" />
            {marked.length > 1 && (
              <path
                d={path}
                fill="none"
                stroke="var(--flow)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            {marked.map((p) => (
              <circle
                key={p.index}
                cx={x(p.index)}
                cy={y(p.mood)}
                r="4.5"
                fill="var(--card)"
                stroke="var(--flow)"
                strokeWidth="2.5"
              />
            ))}
          </svg>
          <ul className="grid grid-cols-7 justify-items-center">
            {days.map((day) => (
              <li key={day.interventionDay}>
                {day.mood === null ? (
                  <span aria-hidden className="block size-6 rounded-full border border-dashed border-border" />
                ) : (
                  <MoodOrb mood={day.mood as Mood} className="size-6" />
                )}
              </li>
            ))}
          </ul>
          <p className="text-base text-muted-foreground fit:hidden">{t("home.moodWeekHint")}</p>
        </>
      )}
    </section>
  );
}
