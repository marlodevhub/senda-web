"use client";

import { useTranslations } from "next-intl";

const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * Meta semanal (RN-DI-08, RN-IN-07): 3 días con registro por semana, no una racha. El anillo se llena por
 * días ("2 días de 3"); nunca un porcentaje de mejora (RN-TR-04).
 */
export function GoalRing({ daysWithEntry, goal }: { daysWithEntry: number; goal: number }) {
  const t = useTranslations();
  const met = daysWithEntry >= goal;
  const filled = Math.min(1, daysWithEntry / goal);

  return (
    <section
      aria-labelledby="home-goal"
      className="flex flex-col items-center gap-3 rounded-lg bg-card p-5 text-center shadow-card"
    >
      <h2 id="home-goal" className="self-start font-heading text-lg font-bold text-foreground">
        {t("home.goalLabel")}
      </h2>
      <div className="relative size-32">
        <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden>
          <circle cx="50" cy="50" r={RADIUS} fill="none" stroke="var(--muted)" strokeWidth="10" />
          <circle
            cx="50"
            cy="50"
            r={RADIUS}
            fill="none"
            stroke="var(--sprout)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - filled)}
            className="transition-[stroke-dashoffset] duration-700 ease-out"
          />
        </svg>
        <p className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-heading text-3xl font-bold text-foreground tabular-nums">{daysWithEntry}</span>
          <span className="text-base text-muted-foreground">{t("home.statOf", { total: goal })}</span>
        </p>
      </div>
      <p className="text-base text-foreground">
        {met ? t("home.goalMet") : t("home.goalCount", { days: daysWithEntry, goal })}
      </p>
    </section>
  );
}
