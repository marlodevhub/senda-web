"use client";

import { useTranslations } from "next-intl";
import { useEntryDetail } from "@/features/journal/api/use-entries";
import type { EntryAnalysisField, JournalEntryDetail } from "@/features/journal/api/get-entry-detail";
import { RewriteForm, type PhraseContext } from "@/features/rewrite/components/rewrite-form";

const FIELD: Record<EntryAnalysisField, { text: keyof JournalEntryDetail; labelKey: string }> = {
  Q1: { text: "q1", labelKey: "history.q1Label" },
  Q2: { text: "q2", labelKey: "history.q2Label" },
  Q3: { text: "q3", labelKey: "history.q3Label" },
  FREE_TEXT: { text: "freeText", labelKey: "history.freeTextLabel" },
};

/**
 * CU-04 con su contexto: la Reescritura muestra la frase dentro del párrafo donde la escribió, resaltada. El texto
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
    return {
      label: t(labelKey),
      text: paragraph,
      start: finding.start,
      end: finding.end,
      number: findings.indexOf(finding) + 1,
      total: findings.length,
    };
  }

  return <RewriteForm journalEntryId={journalEntryId} findingId={findingId} phraseContext={phraseContext} />;
}
