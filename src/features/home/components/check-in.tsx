"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { Mood } from "@/components/icons/mood-orb";
import { MoodPicker } from "@/features/journal/components/mood-picker";
import { useRecordCheckIn } from "@/features/home/api/use-record-check-in";
import { BffError } from "@/lib/api/client";
import { errorMessageKey } from "@/lib/api/error-messages";

/**
 * CU-06 Registrar check-in de ánimo: una cara, sin texto (RN-IN-04). Se
 * puede cambiar el mismo día (RN-IN-03). Con 1 o 2 invita a escribir, sin
 * obligar (RN-IN-05). No cuenta para la meta.
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
        {justSaved && <p className="text-sm text-muted-foreground">{t("home.checkinThanks")}</p>}
        {mood !== null && mood <= 2 && (
          <div className="flex flex-col gap-2 rounded-lg bg-card p-4 shadow-card">
            <p className="text-sm leading-relaxed text-foreground">{t("home.checkinInvitation")}</p>
            <Button asChild variant="soft">
              <Link href="/diario">{t("home.writeCta")}</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
