"use client";

import { useState } from "react";
import { readFieldTexts } from "@/lib/field-texts-cache";
import { MirrorView, type JournalFieldTexts } from "@/features/analysis/components/mirror-view";

/**
 * sessionStorage solo existe en el navegador — este puente de cliente
 * separa esa lectura de la página servidor de `app/`. Lectura perezosa
 * en el estado inicial (no un efecto) porque no hay nada a lo que
 * resincronizarse: la página se remonta entera en cada navegación.
 */
export function MirrorPageClient({ journalEntryId }: { journalEntryId: number }) {
  const [fieldTexts] = useState<JournalFieldTexts>(() =>
    typeof window === "undefined" ? {} : (readFieldTexts(journalEntryId) as JournalFieldTexts),
  );

  return <MirrorView journalEntryId={journalEntryId} fieldTexts={fieldTexts} />;
}
