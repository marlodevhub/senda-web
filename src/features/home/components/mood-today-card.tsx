"use client";

import { useTranslations } from "next-intl";
import { MoodMascot, nearestMood } from "@/components/icons/mood-mascot";
import { MOOD_INK, moodBlend } from "@/components/icons/mood-orb";
import { cn } from "@/lib/utils";

/**
 * CU-05 (RN-IN-08): cómo va el día hasta ahora, en un recuadro con un degradado del color del ánimo y la mascota. El ánimo de hoy es el
 * promedio de las marcas del check-in (RN-IN-03) o, si no marcó, el de su último registro; el color mezcla las dos
 * caritas vecinas en proporción a ese promedio y el nombre es el de la carita más cercana. Sin ánimo de hoy, el
 * recuadro va en el color del tema y la mascota, en gris, espera tranquila, sin reproche.
 */
export function MoodTodayCard({ average }: { average: number | null }) {
  const t = useTranslations();

  const colors = average === null ? null : moodBlend(average);

  return (
    <section
      aria-labelledby="home-mood-today"
      className={cn(
        "relative isolate flex items-center gap-4 overflow-hidden rounded-lg p-5 shadow-card",
        colors === null && "bg-linear-to-br from-primary to-primary/75 text-primary-foreground",
      )}
      style={
        colors === null
          ? undefined
          : { backgroundImage: `linear-gradient(135deg, ${colors.light} 0%, ${colors.base} 100%)`, color: MOOD_INK }
      }
    >
      {/* Luces suaves de fondo: un halo detrás de la mascota y otro en la esquina. */}
      <span aria-hidden className="absolute -top-10 -left-8 -z-10 size-40 rounded-full bg-white/35 blur-2xl" />
      <span aria-hidden className="absolute -right-10 -bottom-12 -z-10 size-36 rounded-full bg-white/20 blur-2xl" />
      <span aria-hidden className="relative grid size-28 shrink-0 place-items-center lg:size-24">
        <span className="absolute inset-2 rounded-full bg-white/40" />
        <MoodMascot average={average} className="relative size-full" />
      </span>
      <div className="flex min-w-0 flex-col gap-0.5">
        <h2 id="home-mood-today" className="text-sm font-semibold">
          {t("home.moodTodayTitle")}
        </h2>
        {average === null ? (
          <p className="text-base">{t("home.moodTodayEmpty")}</p>
        ) : (
          <>
            <p className="font-heading text-3xl font-bold">{t(`mood.${nearestMood(average)}`)}</p>
            <p className="text-sm">{t("home.moodTodayHint")}</p>
          </>
        )}
      </div>
    </section>
  );
}
