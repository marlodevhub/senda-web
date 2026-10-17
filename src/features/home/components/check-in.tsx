"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { moodSolidStyle, type Mood } from "@/components/icons/mood-orb";
import { MoodPicker } from "@/components/forms/mood-picker";
import { useRecordCheckIn } from "@/features/home/api/use-record-check-in";
import { BffError } from "@/lib/api/client";
import { errorMessageKey } from "@/lib/api/error-messages";
import { cn } from "@/lib/utils";

/**
 * CU-06 Registrar check-in de ánimo: una cara, sin texto (RN-IN-04). Se
 * puede cambiar el mismo día (RN-IN-03). No cuenta para la meta. Al marcar
 * una cara aparece la invitación a escribir de esa cara con el botón Escribir
 * de Inicio (sin obligar). Sin cara marcada no
 * hay botón. El Diario abre con esta cara ya marcada (RN-IN-09).
 */
/** Cada cara tiene su invitación a escribir (con 1 o 2, la de día difícil, RN-IN-05). */
const INVITATION_KEY = { 1: "veryLow", 2: "low", 3: "neutral", 4: "good", 5: "veryGood" } as const satisfies Record<
  Mood,
  string
>;

export function CheckIn({ initialMood }: { initialMood: Mood | null }) {
  const t = useTranslations();
  const recordCheckIn = useRecordCheckIn();
  const [mood, setMood] = useState<Mood | null>(initialMood);
  // Cuántas veces se tocó una cara: cada toque vuelve a montar la invitación para repetir la animación. En 0 (el
  // check-in ya estaba hecho al abrir Inicio) aparece quieta.
  const [presses, setPresses] = useState(0);
  const animate = presses > 0;

  async function handleChange(next: Mood) {
    const previous = mood;
    setMood(next);
    setPresses((count) => count + 1);
    try {
      await recordCheckIn.mutateAsync(next);
    } catch (error) {
      setMood(previous);
      toast.error(t(error instanceof BffError ? errorMessageKey(error.code) : "common.unexpectedError"));
    }
  }

  return (
    <section aria-labelledby="checkin-question" className="flex flex-col gap-2">
      <h2 id="checkin-question" className="font-heading text-lg font-bold text-foreground">
        {t("home.checkinQuestion")}
      </h2>
      {/* Un solo contenedor: las caras y, al marcar una, debajo la invitación con el botón Escribir. */}
      <div className="flex flex-col rounded-lg bg-card p-3 shadow-card">
        <MoodPicker bare label={t("home.checkinQuestion")} value={mood ?? undefined} onChange={handleChange} />
        <div aria-live="polite">
          {mood !== null && (
            <div
              key={presses}
              className={cn(
                "mt-3 flex flex-col gap-3 border-t border-border/70 px-1 pt-3 pb-1",
                animate && "liquid-rise-text",
              )}
            >
              <p className="text-base leading-relaxed text-foreground">
                {t(`home.checkinInvitation.${INVITATION_KEY[mood]}`)}
              </p>
              {/* Sólido en el color de la cara elegida. */}
              <Button asChild size="xl" className="w-full rounded-full" style={moodSolidStyle(mood)}>
                {/* Lleva la cara elegida: el Diario abre con esa, aunque haya un borrador con otra. */}
                <Link href={`/diario?animo=${mood}`}>
                  <PenLine className="size-4" aria-hidden />
                  {t("home.writeCta")}
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
