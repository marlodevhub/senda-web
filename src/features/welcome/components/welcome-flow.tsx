"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCompleteWelcome } from "@/features/welcome/api/use-welcome";

const SCREENS = ["whatItIs", "whatItIsNot", "howToUse"] as const;
const MAX_STARTING_POINT = 500;

/**
 * CU-17 Completar bienvenida: 3 pantallas fijas (RN-AC-09) — qué es, qué no
 * es (con Línea 113 y SAMU 106) y cómo se usa —, la pregunta opcional "Mi
 * punto de partida" y "Empezar", que lleva a Inicio.
 */
export function WelcomeFlow({ initialStartingPoint }: { initialStartingPoint?: string | null }) {
  const t = useTranslations();
  const router = useRouter();
  const complete = useCompleteWelcome();
  const [step, setStep] = useState(0);
  const [startingPoint, setStartingPoint] = useState(initialStartingPoint ?? "");
  const onQuestion = step === SCREENS.length;

  async function start() {
    try {
      await complete.mutateAsync(startingPoint);
      router.push("/inicio");
    } catch {
      toast.error(t("common.unexpectedError"));
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <ol className="flex justify-center gap-2" aria-label={t("welcome.progressLabel", { step: step + 1, total: SCREENS.length + 1 })}>
        {[...SCREENS, "question"].map((screen, index) => (
          <li
            key={screen}
            aria-current={index === step ? "step" : undefined}
            className={cn("size-2 rounded-full", index === step ? "bg-bloom-ink" : "bg-muted-foreground/30")}
          />
        ))}
      </ol>

      <div aria-live="polite" className="flex min-h-48 flex-col gap-3">
        {onQuestion ? (
          <>
            <Label htmlFor="startingPoint" className="font-heading text-lg font-bold text-foreground">
              {t("welcome.startingPoint")}
            </Label>
            <Textarea
              id="startingPoint"
              value={startingPoint}
              maxLength={MAX_STARTING_POINT}
              onChange={(e) => setStartingPoint(e.target.value)}
              aria-describedby="startingPointHint"
              rows={4}
            />
            <p id="startingPointHint" className="text-sm text-muted-foreground">
              {t("welcome.startingPointHint")}
            </p>
          </>
        ) : (
          <>
            <h2 className="font-heading text-lg font-bold text-foreground">{t(`welcome.${SCREENS[step]}Title`)}</h2>
            <p className="text-base leading-relaxed text-foreground">{t(`welcome.${SCREENS[step]}Body`)}</p>
          </>
        )}
      </div>

      <div className="flex gap-2">
        {step > 0 && (
          <Button variant="outline" className="flex-1" onClick={() => setStep(step - 1)}>
            {t("common.back")}
          </Button>
        )}
        {onQuestion ? (
          <Button variant="hero" className="flex-1" disabled={complete.isPending} onClick={start}>
            {complete.isPending ? t("welcome.starting") : t("welcome.start")}
          </Button>
        ) : (
          <Button className="flex-1" onClick={() => setStep(step + 1)}>
            {t("welcome.next")}
          </Button>
        )}
      </div>
    </div>
  );
}
