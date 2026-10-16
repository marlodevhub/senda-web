"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { FieldError } from "@/components/forms/field-error";
import { GenderPicker } from "@/components/forms/gender-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCompleteWelcome } from "@/features/welcome/api/use-welcome";
import { applyPalette } from "@/lib/palette";
import type { Gender } from "@/types/gender";

const SCREENS = ["whatItIs", "whatItIsNot", "howToUse"] as const;
const MAX_STARTING_POINT = 500;
const MAX_NAME = 30;

type Step = "identity" | (typeof SCREENS)[number] | "question";

/**
 * CU-17 Completar bienvenida: 3 pantallas fijas (RN-AC-09) — qué es, qué no
 * es (con Línea 113 y SAMU 106) y cómo se usa.
 * - `first-time`: si todavía no lo dio, empieza con "Cuéntanos de ti" (cómo
 *   quiere que lo llamen y su sexo, obligatorios; el sexo elige el tema de
 *   color al instante). Se puede saltar a la pregunta opcional "Mi punto de
 *   partida"; "Empezar" la marca como vista y lleva a Inicio.
 * - `review` (desde Perfil, RN-AC-13): solo las 3 pantallas; "Listo" vuelve a
 *   Perfil sin guardar nada.
 */
export function WelcomeFlow({
  mode = "first-time",
  initialStartingPoint,
  identityRequired = false,
}: {
  mode?: "first-time" | "review";
  initialStartingPoint?: string | null;
  identityRequired?: boolean;
}) {
  const t = useTranslations();
  const router = useRouter();
  const complete = useCompleteWelcome();
  const review = mode === "review";
  const askIdentity = !review && identityRequired;
  const steps: Step[] = [
    ...(askIdentity ? ["identity" as const] : []),
    ...SCREENS,
    ...(review ? [] : ["question" as const]),
  ];

  const [index, setIndex] = useState(0);
  const [startingPoint, setStartingPoint] = useState(initialStartingPoint ?? "");
  const [name, setName] = useState("");
  const [gender, setGender] = useState<Gender>();
  const [showIdentityErrors, setShowIdentityErrors] = useState(false);

  const step = steps[index];
  const onLastScreen = index === steps.length - 1;
  const nameMissing = name.trim() === "";

  function next() {
    if (step === "identity") {
      if (nameMissing || !gender) {
        setShowIdentityErrors(true);
        return;
      }
      applyPalette(gender);
    }
    setIndex(index + 1);
  }

  async function start() {
    try {
      await complete.mutateAsync({
        startingPoint,
        ...(askIdentity && { preferredName: name, gender }),
      });
      router.push("/inicio");
    } catch {
      toast.error(t("common.unexpectedError"));
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <ol
        className="flex justify-center gap-2"
        aria-label={t("welcome.progressLabel", { step: index + 1, total: steps.length })}
      >
        {steps.map((screen, i) => (
          <li
            key={screen}
            aria-current={i === index ? "step" : undefined}
            className={cn("size-2 rounded-full", i === index ? "bg-bloom-ink" : "bg-muted-foreground/30")}
          />
        ))}
      </ol>

      <div aria-live="polite" className="flex min-h-48 flex-col gap-3">
        {step === "identity" ? (
          <>
            <h2 className="font-heading text-lg font-bold text-foreground">{t("welcome.identityTitle")}</h2>
            <p className="text-base leading-relaxed text-muted-foreground">{t("welcome.identityIntro")}</p>
            <div className="flex flex-col gap-2">
              <Label htmlFor="preferredName" className="text-base font-semibold text-foreground">
                {t("welcome.nameLabel")}
              </Label>
              <Input
                id="preferredName"
                value={name}
                maxLength={MAX_NAME}
                autoComplete="given-name"
                aria-invalid={(showIdentityErrors && nameMissing) || undefined}
                onChange={(e) => setName(e.target.value)}
              />
              {showIdentityErrors && nameMissing && <FieldError message="welcome.nameRequired" />}
            </div>
            <div className="flex flex-col gap-2">
              <p id="genderLabel" className="text-base font-semibold text-foreground">
                {t("welcome.genderLabel")}
              </p>
              <GenderPicker
                labelledBy="genderLabel"
                value={gender}
                onChange={setGender}
                invalid={showIdentityErrors && !gender}
              />
              {showIdentityErrors && !gender && <FieldError message="welcome.genderRequired" />}
            </div>
          </>
        ) : step === "question" ? (
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
            <h2 className="font-heading text-lg font-bold text-foreground">{t(`welcome.${step}Title`)}</h2>
            <p className="text-base leading-relaxed text-foreground">{t(`welcome.${step}Body`)}</p>
          </>
        )}
      </div>

      <div className="flex gap-2">
        {index > 0 && (
          <Button variant="outline" className="flex-1" onClick={() => setIndex(index - 1)}>
            {t("common.back")}
          </Button>
        )}
        {review && onLastScreen ? (
          <Button className="flex-1" onClick={() => router.push("/perfil")}>
            {t("welcome.done")}
          </Button>
        ) : step === "question" ? (
          <Button variant="hero" className="flex-1" disabled={complete.isPending} onClick={start}>
            {complete.isPending ? t("welcome.starting") : t("welcome.start")}
          </Button>
        ) : (
          <Button className="flex-1" onClick={next}>
            {t("welcome.next")}
          </Button>
        )}
      </div>

      {/* NN/g: el tutorial se puede saltar la primera vez y volver a ver desde Perfil; "Cuéntanos de ti" no. */}
      {!review && SCREENS.some((screen) => screen === step) && (
        <Button variant="ghost" className="self-center" onClick={() => setIndex(steps.length - 1)}>
          {t("welcome.skip")}
        </Button>
      )}
    </div>
  );
}
