"use client";

import { useTranslations } from "next-intl";
import { ChevronRight } from "lucide-react";
import { MoodOrb, type Mood } from "@/components/icons/mood-orb";
import { cn } from "@/lib/utils";

/** Un intento de reescritura: su número y la carita que le dio la IA (null si todavía no se leyó). */
export type ProgressAttempt = { attemptNumber: number; mood: Mood | null };

/**
 * El progreso de reescribir un registro (CU-04): la carita que la IA le puso a cada intento, en orden, de la roja a
 * la verde. El último va un poco más grande. Sin puntaje ni porcentaje: solo cómo sonó cada intento (regla 2).
 */
export function MoodProgress({ attempts, className }: { attempts: ProgressAttempt[]; className?: string }) {
  const t = useTranslations();
  return (
    <ol className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {attempts.map((attempt, index) => {
        const last = index === attempts.length - 1;
        const label =
          attempt.mood === null
            ? t("rewrite.attemptPendingLabel", { n: attempt.attemptNumber })
            : t("rewrite.attemptLabel", { n: attempt.attemptNumber, mood: t(`mood.${attempt.mood}`) });
        return (
          <li key={attempt.attemptNumber} className="flex items-center gap-1.5">
            {attempt.mood === null ? (
              <MoodOrb mood={3} muted className={last ? "size-10" : "size-8"} decorative />
            ) : (
              <MoodOrb mood={attempt.mood} decorative className={last ? "size-10" : "size-8"} />
            )}
            <span className="sr-only">{label}</span>
            {!last && <ChevronRight className="size-4 text-muted-foreground" aria-hidden />}
          </li>
        );
      })}
    </ol>
  );
}
