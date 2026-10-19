"use client";

import { useTranslations } from "next-intl";
import { useEntryDetail } from "@/features/journal/api/use-entries";
import type { EntryAnalysisField, JournalEntryDetail } from "@/features/journal/api/get-entry-detail";
import { RewriteForm, type EntryContext } from "@/features/rewrite/components/rewrite-form";

const FIELD: Record<EntryAnalysisField, { text: keyof JournalEntryDetail; labelKey: string }> = {
  Q1: { text: "q1", labelKey: "history.q1Label" },
  Q2: { text: "q2", labelKey: "history.q2Label" },
  Q3: { text: "q3", labelKey: "history.q3Label" },
  FREE_TEXT: { text: "freeText", labelKey: "history.freeTextLabel" },
};

/** El orden en que se escriben las respuestas del modo guiado. */
const GUIDED_ORDER: EntryAnalysisField[] = ["Q1", "Q2", "Q3"];

/**
 * CU-04 con su contexto: la Reescritura muestra el registro completo (en modo guiado, las 3 respuestas) con todas sus
 * frases duras resaltadas, y parte de ese texto para reescribir. Viene del detalle del registro (CU-11, solo para su
 * dueño); se compone aquí porque una feature no importa otra.
 */
export function RewriteWithContext({ journalEntryId }: { journalEntryId: number }) {
  const t = useTranslations();
  const { data: entry } = useEntryDetail(journalEntryId);

  function entryContext(): EntryContext | null {
    if (!entry) return null;
    const findings = entry.mirror?.findings ?? [];
    const fields: EntryAnalysisField[] = entry.mode === "GUIDED" ? GUIDED_ORDER : ["FREE_TEXT"];
    const paragraphs = fields.flatMap((field) => {
      const text = entry[FIELD[field].text];
      if (typeof text !== "string" || text.trim().length === 0) return [];
      return [
        {
          label: t(FIELD[field].labelKey),
          text,
          ranges: findings
            .filter((finding) => finding.field === field)
            .map((finding) => ({
              key: finding.findingId,
              start: finding.start,
              end: finding.end,
              pattern: finding.pattern,
              badge: findings.indexOf(finding) + 1,
            })),
        },
      ];
    });
    return { paragraphs, originalText: paragraphs.map((paragraph) => paragraph.text).join("\n\n") };
  }

  return <RewriteForm journalEntryId={journalEntryId} entryContext={entryContext()} />;
}
