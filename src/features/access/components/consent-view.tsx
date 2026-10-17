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
import { logout } from "@/lib/auth/logout";

/** Lo que va antes de ":" al inicio de un párrafo, si es corto, es su título ("Quién puede leer tus textos:"). */
const LEAD_MAX_LENGTH = 60;

/**
 * El texto del consentimiento viene del YAML congelado (PT-02) partido en líneas de ~80 caracteres: los párrafos son
 * los bloques separados por una línea en blanco y dentro de cada uno los saltos son solo del archivo.
 */
function toParagraphs(text: string): { lead: string; body: string }[] {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean)
    .map((paragraph) => {
      const colon = paragraph.indexOf(": ");
      return colon > 0 && colon < LEAD_MAX_LENGTH
        ? { lead: paragraph.slice(0, colon + 1), body: paragraph.slice(colon + 2) }
        : { lead: "", body: paragraph };
    });
}

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
        <h2 className="font-heading text-lg font-semibold text-foreground">{t("consent.declinedTitle")}</h2>
        <p className="text-base text-muted-foreground">{t("consent.declinedBody")}</p>
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
        className="flex max-h-[55vh] min-h-64 flex-col gap-4 overflow-y-auto rounded-lg bg-muted p-5 text-base leading-relaxed text-foreground md:p-8 md:text-lg"
      >
        {toParagraphs(consent.text).map(({ lead, body }) => (
          <p key={lead + body}>
            {lead && <strong className="font-semibold">{lead} </strong>}
            {body}
          </p>
        ))}
      </div>
      {!reachedEnd && <p className="text-base text-muted-foreground">{t("consent.scrollHint")}</p>}

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

      <div className="mt-2 flex flex-col gap-2 md:flex-row-reverse md:items-center">
        <Button
          type="button"
          variant="hero"
          size="xl"
          disabled={!reachedEnd || !acknowledged || isSubmitting}
          className="md:min-w-56"
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
