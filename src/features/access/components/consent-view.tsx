"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { BffError } from "@/lib/api/client";
import { errorMessageKey } from "@/lib/api/error-messages";
import { acceptConsent, type ConsentContent } from "@/features/access/api/consent";
import { logout } from "@/features/access/api/logout";

/** CU-16: "Acepto" se habilita solo al llegar al final del texto (RN-AC-07), y solo con la casilla marcada. */
export function ConsentView({ consent }: { consent: ConsentContent }) {
  const t = useTranslations();
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [reachedEnd, setReachedEnd] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [useForEvaluation, setUseForEvaluation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [declined, setDeclined] = useState(false);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 24;
    if (atBottom) setReachedEnd(true);
  }

  async function handleAccept() {
    setIsSubmitting(true);
    try {
      await acceptConsent({ version: consent.version, useForEvaluation });
      // CU-17: después del consentimiento, la bienvenida (RN-AC-11).
      router.push("/bienvenida");
    } catch (error) {
      if (error instanceof BffError) {
        toast.error(t(errorMessageKey(error.code)));
      } else {
        toast.error(t("common.unexpectedError"));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDecline() {
    setDeclined(true);
    await logout();
  }

  if (declined) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <h2 className="font-heading text-lg font-semibold text-foreground">
          {t("consent.declinedTitle")}
        </h2>
        <p className="text-sm text-muted-foreground">{t("consent.declinedBody")}</p>
        <Button variant="soft" onClick={() => router.push("/login")}>
          {t("common.goToLogin")}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="max-h-80 overflow-y-auto rounded-lg bg-muted p-4 text-sm leading-relaxed whitespace-pre-line text-foreground"
      >
        {consent.text}
      </div>
      {!reachedEnd && <p className="text-xs text-muted-foreground">{t("consent.scrollHint")}</p>}

      <div className="flex items-center gap-2">
        <Checkbox
          id="acknowledged"
          checked={acknowledged}
          onCheckedChange={(checked) => setAcknowledged(checked === true)}
          disabled={!reachedEnd}
        />
        <Label htmlFor="acknowledged">{t("consent.acceptCheckbox")}</Label>
      </div>

      <div className="flex items-start gap-2">
        <Checkbox
          id="useForEvaluation"
          checked={useForEvaluation}
          onCheckedChange={(checked) => setUseForEvaluation(checked === true)}
        />
        <Label htmlFor="useForEvaluation" className="font-normal text-muted-foreground">
          {t("consent.useForEvaluationLabel")}
        </Label>
      </div>

      <div className="mt-2 flex flex-col gap-2">
        <Button
          type="button"
          variant="hero"
          size="xl"
          disabled={!reachedEnd || !acknowledged || isSubmitting}
          onClick={handleAccept}
        >
          {t("consent.acceptButton")}
        </Button>
        <Button type="button" variant="ghost" onClick={handleDecline}>
          {t("consent.declineButton")}
        </Button>
      </div>
    </div>
  );
}
