"use client";

import { useTranslations } from "next-intl";
import { useEntryDetail } from "@/features/journal/api/use-entries";
import type { EntryAnalysisField, JournalEntryDetail } from "@/features/journal/api/get-entry-detail";
import { RewriteForm, type PhraseContext } from "@/features/rewrite/components/rewrite-form";

/** El orden en que se escriben las respuestas del modo guiado. */
const GUIDED_ORDER: EntryAnalysisField[] = ["Q1", "Q2", "Q3"];

const FIELD: Record<EntryAnalysisField, { text: keyof JournalEntryDetail; labelKey: string }> = {
  Q1: { text: "q1", labelKey: "history.q1Label" },
  Q2: { text: "q2", labelKey: "history.q2Label" },
  Q3: { text: "q3", labelKey: "history.q3Label" },
  FREE_TEXT: { text: "freeText", labelKey: "history.freeTextLabel" },
};

/**
 * CU-04 con su contexto: la Reescritura muestra el registro completo (en modo guiado, las 3 respuestas) con la frase
 * resaltada dentro del párrafo donde la escribió. El texto
 * viene del detalle del registro (CU-11, solo para su dueño); se compone aquí porque una feature no importa otra.
 */
export function RewriteWithContext({ journalEntryId, findingId }: { journalEntryId: number; findingId?: number }) {
  const t = useTranslations();
  const { data: entry } = useEntryDetail(journalEntryId);

  function phraseContext(activeFindingId: number): PhraseContext | null {
    const findings = entry?.mirror?.findings ?? [];
    const finding = findings.find((candidate) => candidate.findingId === activeFindingId);
    if (!entry || !finding) return null;
    const { text, labelKey } = FIELD[finding.field];
    const paragraph = entry[text];
    if (typeof paragraph !== "string" || paragraph.length === 0) return null;
    // Modo guiado: las otras respuestas también, en su orden, para reescribir con todo lo que escribió.
    const position = GUIDED_ORDER.indexOf(finding.field);
    const others =
      position === -1
        ? []
        : GUIDED_ORDER.flatMap((field, index) => {
            const other = entry[FIELD[field].text];
            return field !== finding.field && typeof other === "string" && other.trim().length > 0
              ? [{ label: t(FIELD[field].labelKey), text: other, before: index < position }]
              : [];
          });
    return {
      label: t(labelKey),
      text: paragraph,
      start: finding.start,
      end: finding.end,
      others,
      number: findings.indexOf(finding) + 1,
      total: findings.length,
    };
  }

  return <RewriteForm journalEntryId={journalEntryId} findingId={findingId} phraseContext={phraseContext} />;
}
