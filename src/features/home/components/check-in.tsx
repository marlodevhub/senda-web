"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Mood } from "@/components/icons/mood-orb";
import { MoodPicker } from "@/features/journal/components/mood-picker";
import { useRecordCheckIn } from "@/features/home/api/use-record-check-in";
import { BffError } from "@/lib/api/client";
import { errorMessageKey } from "@/lib/api/error-messages";
import { cn } from "@/lib/utils";

/**
 * CU-06 Registrar check-in de ánimo: una cara, sin texto (RN-IN-04). Se
 * puede cambiar el mismo día (RN-IN-03). No cuenta para la meta. Al marcar
 * una cara aparece la invitación a escribir con el botón Escribir de Inicio
 * (con 1 o 2, la de día difícil, RN-IN-05; sin obligar). Sin cara marcada no
 * hay botón. El Diario abre con esta cara ya marcada (RN-IN-09).
 */
export function CheckIn({ initialMood }: { initialMood: Mood | null }) {
  const t = useTranslations();
  const recordCheckIn = useRecordCheckIn();
  const [mood, setMood] = useState<Mood | null>(initialMood);
  // Solo al tocar una cara: si el check-in ya estaba hecho al abrir Inicio, la invitación aparece quieta.
  const [animate, setAnimate] = useState(false);

  async function handleChange(next: Mood) {
    const previous = mood;
    setMood(next);
    setAnimate(true);
    try {
      await recordCheckIn.mutateAsync(next);
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
        {/* La invitación cae de las caras como una gota que se estira y se asienta (liquid-rise en globals.css). */}
        {mood !== null && (
          <div
            className={cn(
              "relative isolate flex flex-col gap-3 rounded-lg bg-card p-4 shadow-card",
              animate && "liquid-rise",
            )}
          >
            <div className={cn("flex flex-col gap-3", animate && "liquid-rise-text")}>
              <p className="text-base leading-relaxed text-foreground">
                {t(mood <= 2 ? "home.checkinInvitation" : "home.checkinInvitationWrite")}
              </p>
              <Button asChild variant="hero" size="xl" className="rounded-full">
                <Link href="/diario">
                  <PenLine className="size-4" aria-hidden />
                  {t("home.writeCta")}
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
