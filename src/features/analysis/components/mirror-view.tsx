"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMirror, useConfirmMirror } from "@/features/analysis/api/use-mirror";
import type { MirrorFinding, AnalysisField } from "@/features/analysis/api/get-mirror";
import { FindingCard } from "@/features/analysis/components/finding-card";
import { ConfirmationPills, type ConfirmationAnswer } from "@/features/analysis/components/confirmation-pills";
import { CareMessage } from "@/features/analysis/components/care-message";
import { patternLabelKey } from "@/features/analysis/pattern-labels";

/** Las 3 preguntas del Diario guardan el texto por campo (RS-ES-06). */
export type JournalFieldTexts = Partial<Record<AnalysisField, string>>;

function fragmentOf(finding: MirrorFinding, fieldTexts: JournalFieldTexts): string {
  const text = fieldTexts[finding.field] ?? "";
  return text.slice(finding.start, finding.end);
}

const DIMENSION_KEY: Record<string, "d1" | "d2" | "d3"> = { D1: "d1", D2: "d2", D3: "d3" };
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
export function MirrorView({
  journalEntryId,
  fieldTexts,
}: {
  journalEntryId: number;
  fieldTexts: JournalFieldTexts;
}) {
  const t = useTranslations();
  const router = useRouter();
  const { data: mirror, isPending } = useMirror(journalEntryId);
  const confirmMutation = useConfirmMirror(journalEntryId);

  if (isPending || !mirror) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden />
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
      </div>
    );
  }

  if (mirror.status === "RISK") {
    return (
      <div className="flex flex-col gap-4">
        <CareMessage />
        <Button variant="soft" onClick={() => router.push("/inicio")}>
          {t("analysis.goHome")}
        </Button>
      </div>
    );
  }

  if (mirror.status === "PENDING") {
    return (
      <div className="flex flex-col gap-4 text-center">
        <p className="text-sm text-muted-foreground">{t("analysis.pending")}</p>
        <Button variant="soft" onClick={() => router.push("/inicio")}>
          {t("analysis.goHome")}
        </Button>
      </div>
    );
  }

  if (mirror.status === "FAILED") {
    return (
      <div className="flex flex-col gap-4 text-center">
        <p className="text-sm text-muted-foreground">{t("analysis.failed")}</p>
        <Button variant="soft" onClick={() => router.push("/inicio")}>
          {t("analysis.goHome")}
        </Button>
      </div>
    );
  }

  const findings = mirror.findings ?? [];

  if (findings.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <p className="font-display text-lg leading-snug text-foreground">{t("analysis.reinforcement")}</p>
        <div className="flex flex-col gap-2">
          <Button variant="soft" asChild>
            <Link href="/progreso">{t("analysis.goToProgress")}</Link>
          </Button>
          <Button variant="outline" onClick={() => router.push("/inicio")}>
            {t("analysis.goHome")}
          </Button>
        </div>
      </div>
    );
  }

  const dimensionMessage =
    mirror.predominantDimension && mirror.intensity
      ? t(
          `analysis.dimensionMessages.${DIMENSION_KEY[mirror.predominantDimension]}.${INTENSITY_KEY[mirror.intensity]}`,
        )
      : null;

  return (
    <div className="flex flex-col gap-5">
      <p className="font-display text-lg leading-snug text-foreground">{t("analysis.recognition")}</p>

      <div className="flex flex-col gap-3">
        {findings.map((finding) => (
          <div key={finding.findingId} className="flex flex-col gap-2">
            <FindingCard
              fragment={fragmentOf(finding, fieldTexts)}
              label={t(patternLabelKey(finding.pattern))}
              dimension={finding.dimension}
            />
            <Button
              variant="outline"
              size="sm"
              className="self-start"
              asChild
            >
              <Link href={`/reescritura/${journalEntryId}?findingId=${finding.findingId}`}>
                {t("analysis.rewriteThisPhrase")}
              </Link>
            </Button>
          </div>
        ))}
      </div>

      {dimensionMessage && <p className="text-sm text-muted-foreground">{dimensionMessage}</p>}

      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold text-foreground">{t("analysis.confirmationQuestion")}</p>
        <ConfirmationPills
          value={mirror.confirmation}
          onChange={(answer: ConfirmationAnswer) => confirmMutation.mutate(answer)}
        />
      </div>

      <Button variant="outline" onClick={() => router.push("/inicio")}>
        {t("analysis.goHome")}
      </Button>
    </div>
  );
}
