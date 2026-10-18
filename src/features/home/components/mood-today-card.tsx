"use client";

import { useTranslations } from "next-intl";
import { MoodMascot } from "@/components/icons/mood-mascot";
import { MOOD_INK, moodColor, type Mood } from "@/components/icons/mood-orb";

/**
 * CU-05 (RN-IN-08): cómo va el día hasta ahora, en un recuadro de color sólido con la mascota. El color y la cara son
 * los del ánimo de hoy: el promedio de las marcas del check-in (RN-IN-03) o, si no marcó, el de su último registro.
 * Sin ánimo de hoy, el recuadro va en el color del tema y la mascota espera tranquila, sin reproche.
 */
export function MoodTodayCard({ mood }: { mood: Mood | null }) {
  const t = useTranslations();

  return (
    <section
      aria-labelledby="home-mood-today"
      className={
        mood === null
          ? "flex items-center gap-4 rounded-lg bg-primary p-5 text-primary-foreground shadow-card"
          : "flex items-center gap-4 rounded-lg p-5 shadow-card"
      }
      style={mood === null ? undefined : { backgroundColor: moodColor(mood), color: MOOD_INK }}
    >
      <MoodMascot mood={mood} className="size-24 shrink-0 lg:size-20" />
      <div className="flex min-w-0 flex-col gap-1">
        <h2 id="home-mood-today" className="font-heading text-lg font-bold">
          {t("home.moodTodayTitle")}
        </h2>
        {mood === null ? (
          <p className="text-base">{t("home.moodTodayEmpty")}</p>
        ) : (
          <>
            <p className="font-heading text-2xl font-bold">{t(`mood.${mood}`)}</p>
            <p className="text-sm">{t("home.moodTodayHint")}</p>
          </>
        )}
      </div>
    </section>
  );
}
