import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";
import { SendaLogo } from "@/components/brand/senda-logo";
import { clampJourneyDay, INTERVENTION_DAYS, INTERVENTION_WEEKS } from "@/lib/journey";

/**
 * CU-05: en qué va de su senda, como una tarjeta destacada al pie del calendario: el día grande ("Día 14 de 28") y,
 * en etiquetas, los días con registro sobre la meta y la semana. Solo describe, sin puntaje ni porcentaje (RN-TR-04,
 * reglas de coherencia 2 y 6). La flecha lleva al jardín, donde se ve lo que creció. Verde profundo por el jardín;
 * el texto blanco cumple AA sobre todo el degradado.
 */
export function JourneyBanner({
  today,
  week,
  goal,
}: {
  today: number;
  week: number;
  goal: { daysWithEntry: number; goal: number } | null;
}) {
  const t = useTranslations();
  return (
    <Link
      href="/progreso/jardin"
      aria-label={t("home.journeyBannerLabel", {
        day: clampJourneyDay(today),
        total: INTERVENTION_DAYS,
      })}
      className="group relative isolate flex min-h-44 flex-col justify-between gap-4 overflow-hidden rounded-[1.75rem] bg-[linear-gradient(140deg,#2E6B4F_0%,#1D4A37_100%)] p-5 text-white shadow-card transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.98]"
    >
      <JourneyLeaves />

      <span className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-semibold text-white/90">
          <SendaLogo className="size-4 text-[#9FE0B4]" />
          {t("home.journeyBannerKicker")}
        </span>
        <ArrowUpRight
          className="size-6 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          aria-hidden
        />
      </span>

      <span className="font-heading text-3xl leading-tight font-bold">
        {t("home.journeyBannerDay", { day: clampJourneyDay(today) })}
        <span className="block text-lg font-semibold text-white/85">
          {t("home.journeyBannerOf", { total: INTERVENTION_DAYS })}
        </span>
      </span>

      <span className="flex flex-wrap gap-2">
        {goal && (
          <span className="rounded-lg bg-white px-2.5 py-1 text-sm font-semibold text-[#1D4A37] shadow-sm">
            {t("home.journeyBannerDays", { days: goal.daysWithEntry, goal: goal.goal })}
          </span>
        )}
        <span className="rounded-lg bg-[#CDEFD8] px-2.5 py-1 text-sm font-semibold text-[#1D4A37] shadow-sm">
          {t("home.journeyBannerWeek", { week, total: INTERVENTION_WEEKS })}
        </span>
      </span>
    </Link>
  );
}

/** Hojas a la derecha con dos puntos de luz, como en la referencia; decorativas. */
function JourneyLeaves() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 200 200"
      className="pointer-events-none absolute -right-6 -bottom-8 -z-10 h-[115%] opacity-90"
    >
      <defs>
        <linearGradient id="journey-leaf" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#3F9A63" />
          <stop offset="1" stopColor="#8FD7A0" />
        </linearGradient>
        <radialGradient id="journey-glow">
          <stop offset="0" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g fill="url(#journey-leaf)">
        <path d="M120 200 C100 150 104 96 132 52 C146 98 142 150 120 200Z" opacity="0.85" />
        <path d="M128 200 C140 150 166 112 200 92 C196 136 170 174 128 200Z" opacity="0.7" />
        <path d="M112 200 C84 166 62 132 58 88 C92 112 110 150 112 200Z" opacity="0.6" />
        <path d="M150 200 C152 160 170 130 196 116 C192 150 176 182 150 200Z" opacity="0.55" />
        <path d="M100 200 C88 176 70 160 42 152 C58 178 78 194 100 200Z" opacity="0.5" />
      </g>
      <circle cx="160" cy="64" r="18" fill="url(#journey-glow)" />
      <circle cx="160" cy="64" r="6" fill="#fff" />
      <circle cx="92" cy="120" r="12" fill="url(#journey-glow)" />
      <circle cx="92" cy="120" r="4" fill="#fff" />
    </svg>
  );
}
