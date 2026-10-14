"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCompleteWelcome } from "@/features/welcome/api/use-welcome";

const SCREENS = ["whatItIs", "whatItIsNot", "howToUse"] as const;
const MAX_STARTING_POINT = 500;

/**
 * CU-17 Completar bienvenida: 3 pantallas fijas (RN-AC-09) — qué es, qué no
 * es (con Línea 113 y SAMU 106) y cómo se usa.
 * - `first-time`: se puede saltar a la pregunta opcional "Mi punto de
 *   partida"; "Empezar" la marca como vista y lleva a Inicio.
 * - `review` (desde Perfil, RN-AC-13): solo las 3 pantallas; "Listo" vuelve a
 *   Perfil sin guardar nada.
 */
export function WelcomeFlow({
  mode = "first-time",
  initialStartingPoint,
}: {
  mode?: "first-time" | "review";
  initialStartingPoint?: string | null;
}) {
  const t = useTranslations();
  const router = useRouter();
  const complete = useCompleteWelcome();
  const [step, setStep] = useState(0);
  const [startingPoint, setStartingPoint] = useState(initialStartingPoint ?? "");
  const review = mode === "review";
  const steps = review ? SCREENS.length : SCREENS.length + 1;
  const onQuestion = !review && step === SCREENS.length;
  const onLastScreen = step === steps - 1;

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
      <ol className="flex justify-center gap-2" aria-label={t("welcome.progressLabel", { step: step + 1, total: steps })}>
        {[...SCREENS, "question"].slice(0, steps).map((screen, index) => (
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
        {review && onLastScreen ? (
          <Button className="flex-1" onClick={() => router.push("/perfil")}>
            {t("welcome.done")}
          </Button>
        ) : onQuestion ? (
          <Button variant="hero" className="flex-1" disabled={complete.isPending} onClick={start}>
            {complete.isPending ? t("welcome.starting") : t("welcome.start")}
          </Button>
        ) : (
          <Button className="flex-1" onClick={() => setStep(step + 1)}>
            {t("welcome.next")}
          </Button>
        )}
      </div>

      {/* NN/g: el tutorial se puede saltar la primera vez y volver a ver desde Perfil. */}
      {!review && !onQuestion && (
        <Button variant="ghost" className="self-center" onClick={() => setStep(SCREENS.length)}>
          {t("welcome.skip")}
        </Button>
      )}
    </div>
  );
}
