"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { BookOpen, Feather, Home, Loader2, ScanFace } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMirror, useConfirmMirror } from "@/features/analysis/api/use-mirror";
import type { MirrorFinding } from "@/features/analysis/api/get-mirror";
import { FindingRow } from "@/components/feedback/finding-row";
import { ConfirmationPills, type ConfirmationAnswer } from "@/features/analysis/components/confirmation-pills";
import { CareMessage } from "@/components/feedback/care-message";
import { MirrorMoment } from "@/features/analysis/components/mirror-moment";
import { sliceFinding, type FieldTexts } from "@/lib/findings";
import { patternLabelKey, patternMessageKey } from "@/lib/pattern-labels";
import { routes } from "@/lib/routes";

/** Las 3 preguntas del Diario guardan el texto por campo (RS-ES-06). */
export type JournalFieldTexts = FieldTexts;

const INTENSITY_KEY: Record<string, "low" | "moderate" | "high"> = {
  LOW: "low",
  MODERATE: "moderate",
  HIGH: "high",
};

/**
 * CU-03 completo: según el estado del análisis (RS-ES-07), muestra el
 * mensaje de cuidado (RIESGO, RN-ES-11), el refuerzo (sin hallazgos,
 * RN-ES-12), o los fragmentos resaltados con su etiqueta, el mensaje de
 * la dimensión predominante y la confirmación (RN-ES-14).
 */
export function MirrorView({ journalEntryId, fieldTexts }: { journalEntryId: number; fieldTexts: JournalFieldTexts }) {
  const t = useTranslations();
  const router = useRouter();
  const { data: mirror, isPending } = useMirror(journalEntryId);
  const confirmMutation = useConfirmMirror(journalEntryId);

  if (isPending || !mirror) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden />
        <p className="text-base text-muted-foreground">{t("common.loading")}</p>
      </div>
    );
  }

  if (mirror.status === "RISK") {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
        <MirrorHeader />
        <CareMessage />
        <Button variant="soft" size="xl" className="rounded-full" onClick={() => router.push("/inicio")}>
          {t("analysis.goHome")}
        </Button>
      </div>
    );
  }

  if (mirror.status === "PENDING" || mirror.status === "FAILED") {
    const pending = mirror.status === "PENDING";
    return (
      <MirrorMoment emotion={pending ? "calm" : "hope"} message={t(pending ? "analysis.pending" : "analysis.failed")}>
        <Button variant="soft" size="xl" className="rounded-full" onClick={() => router.push("/inicio")}>
          {t("analysis.goHome")}
        </Button>
      </MirrorMoment>
    );
  }

  const findings = mirror.findings ?? [];

  if (findings.length === 0) {
    // Sin hallazgos no prueba que la voz fue amable (puede ser un texto solo de hechos): calma, sin celebrar.
    return (
      <MirrorMoment emotion="calm" message={t("analysis.reinforcement")}>
        <Button variant="hero" size="xl" className="rounded-full" asChild>
          <Link href="/progreso">{t("analysis.goToProgress")}</Link>
        </Button>
        <Button variant="ghost" size="xl" className="rounded-full" onClick={() => router.push("/inicio")}>
          {t("analysis.goHome")}
        </Button>
      </MirrorMoment>
    );
  }

  // El mensaje habla del tipo de frase que más pesó en la dimensión predominante (no siempre el mismo por dimensión).
  const mainFinding = findings
    .filter((finding) => finding.dimension === mirror.predominantDimension)
    .reduce<MirrorFinding | null>(
      (best, finding) => (!best || finding.confidence > best.confidence ? finding : best),
      null,
    );
  const intensity = mirror.intensity ? INTENSITY_KEY[mirror.intensity] : null;
  const patternMessage = mainFinding && intensity ? patternMessageKey(mainFinding.pattern, intensity) : null;
  const dimensionMessage =
    mirror.predominantDimension && intensity
      ? t(patternMessage ?? `analysis.dimensionMessages.${mirror.predominantDimension.toLowerCase()}.${intensity}`)
      : null;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      <MirrorHeader />

      {/* La hoja del Espejo: lo que notó, el mensaje de la dimensión y el acceso a reescribir el registro (CU-04). */}
      <section
        aria-labelledby="mirror-recognition"
        className="flex flex-col gap-4 rounded-[2rem] bg-card p-5 shadow-card md:p-8"
      >
        <p id="mirror-recognition" className="font-display text-lg leading-snug text-foreground">
          {t("analysis.recognition")}
        </p>
        <ul className="flex flex-col gap-2">
          {findings.map((finding, index) => {
            const fragment = sliceFinding(finding, fieldTexts);
            return (
              <li key={finding.findingId} className="relative hover:z-10 focus-within:z-10">
                <FindingRow
                  number={index + 1}
                  fragment={fragment}
                  label={t(patternLabelKey(finding.pattern))}
                  dimension={finding.dimension}
                />
              </li>
            );
          })}
        </ul>
        {dimensionMessage && (
          <p className="rounded-md bg-muted/60 px-4 py-3 font-hand text-base leading-relaxed text-foreground md:text-lg">
            {dimensionMessage}
          </p>
        )}
        {/* CU-04: se reescribe el registro completo, con todas sus frases a la vez (no una por una). */}
        <Button variant="hero" size="xl" className="rounded-full sm:self-start" asChild>
          <Link href={routes.rewrite(journalEntryId)}>
            <Feather className="size-4" aria-hidden />
            {t(
              findings.some((finding) => finding.rewritten) ? "analysis.rewriteEntryAgain" : "analysis.rewriteThisEntry",
            )}
          </Link>
        </Button>
      </section>

      {/* RN-ES-14: opcional y se puede cambiar; no cambia el análisis. */}
      <section aria-labelledby="mirror-confirmation" className="flex flex-col gap-3 rounded-lg bg-card p-5 shadow-card">
        <h2 id="mirror-confirmation" className="font-heading text-lg font-bold text-foreground">
          {t("analysis.confirmationQuestion")}
        </h2>
        <ConfirmationPills
          value={mirror.confirmation}
          onChange={(answer: ConfirmationAnswer) => confirmMutation.mutate(answer)}
        />
      </section>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
        <Button variant="ghost" className="rounded-full" asChild>
          <Link href={routes.entry(journalEntryId)}>
            <BookOpen className="size-4" aria-hidden />
            {t("analysis.seeEntry")}
          </Link>
        </Button>
        <Button variant="outline" className="rounded-full" onClick={() => router.push("/inicio")}>
          <Home className="size-4" aria-hidden />
          {t("analysis.goHome")}
        </Button>
      </div>
    </div>
  );
}

/** Título del Espejo con su ícono. */
function MirrorHeader() {
  const t = useTranslations();
  return (
    <header className="flex items-center gap-3">
      <span
        aria-hidden
        className="flex size-11 shrink-0 items-center justify-center rounded-full bg-celeste text-bloom-ink"
      >
        <ScanFace className="size-5" />
      </span>
      <h1 className="font-heading text-xl leading-tight font-bold text-foreground md:text-2xl">
        {t("analysis.title")}
      </h1>
    </header>
  );
}
