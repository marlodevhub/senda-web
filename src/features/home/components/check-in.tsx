"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import type { Mood } from "@/components/icons/mood-orb";
import { MoodPicker } from "@/features/journal/components/mood-picker";
import { useRecordCheckIn } from "@/features/home/api/use-record-check-in";
import { BffError } from "@/lib/api/client";
import { errorMessageKey } from "@/lib/api/error-messages";

/**
 * CU-06 Registrar check-in de ánimo: una cara, sin texto (RN-IN-04). Se
 * puede cambiar el mismo día (RN-IN-03). Con 1 o 2 invita a escribir, sin
 * obligar (RN-IN-05), con el botón Escribir de Inicio que va debajo. No cuenta
 * para la meta. El Diario abre con esta cara ya marcada.
 */
export function CheckIn({ initialMood }: { initialMood: Mood | null }) {
  const t = useTranslations();
  const recordCheckIn = useRecordCheckIn();
  const [mood, setMood] = useState<Mood | null>(initialMood);
  const [justSaved, setJustSaved] = useState(false);

  async function handleChange(next: Mood) {
    const previous = mood;
    setMood(next);
    try {
      await recordCheckIn.mutateAsync(next);
      setJustSaved(true);
    } catch (error) {
      setMood(previous);
      toast.error(t(error instanceof BffError ? errorMessageKey(error.code) : "common.unexpectedError"));
    }
  }

  return (
    <section aria-labelledby="checkin-question" className="flex flex-col gap-2">
      <h2 id="checkin-question" className="text-sm font-semibold text-foreground">
        {t("home.checkinQuestion")}
      </h2>
      <MoodPicker label={t("home.checkinQuestion")} value={mood ?? undefined} onChange={handleChange} />
      <div aria-live="polite" className="flex flex-col gap-2">
        {justSaved && <p className="text-base text-muted-foreground">{t("home.checkinThanks")}</p>}
        {/*
          La invitación apunta al botón Escribir de Inicio, justo debajo: no se repite aquí. Sale de él como una
          gota que sube, se estira y se asienta (liquid-rise en globals.css).
        */}
        {mood !== null && mood <= 2 && (
          <p className="liquid-rise relative isolate rounded-lg bg-card px-4 py-3 text-base leading-relaxed text-foreground shadow-card">
            <span className="liquid-rise-text">{t("home.checkinInvitation")}</span>
          </p>
        )}
      </div>
    </section>
  );
}
