"use client";

import { useState } from "react";
import { readFieldTexts } from "@/lib/field-texts-cache";
import { MirrorView, type JournalFieldTexts } from "@/features/analysis/components/mirror-view";
import { useEntryDetail } from "@/features/journal/api/use-entries";

/**
 * El Espejo necesita el texto de cada campo para recortar el fragmento de cada hallazgo (el backend solo manda
 * inicio y fin, RS-ES-06). Recién guardado, el texto está en sessionStorage (sin esperar a la red); si se abre
 * después (otra pestaña, otro día o al recargar), sale del detalle del registro, que su dueño puede leer (RS-HI-01).
 */
export function MirrorPageClient({ journalEntryId }: { journalEntryId: number }) {
  const [cached] = useState<JournalFieldTexts>(() =>
    typeof window === "undefined" ? {} : (readFieldTexts(journalEntryId) as JournalFieldTexts),
  );
  const { data: entry } = useEntryDetail(journalEntryId);

  const fieldTexts: JournalFieldTexts = entry
    ? { Q1: entry.q1 ?? "", Q2: entry.q2 ?? "", Q3: entry.q3 ?? "", FREE_TEXT: entry.freeText ?? "" }
    : cached;

  return <MirrorView journalEntryId={journalEntryId} fieldTexts={fieldTexts} />;
}
