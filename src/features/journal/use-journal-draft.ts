"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { useWatch, type Control, type UseFormGetValues, type UseFormReset } from "react-hook-form";
import type { JournalFormValues } from "@/features/journal/schemas/journal.schema";
import { DRAFT_DEBOUNCE_MS, DRAFT_INTERVAL_MS, hasText, loadDraft, saveDraft } from "@/features/journal/draft";

/**
 * RS-DI-03: el borrador del Diario, para no perder lo escrito si se cierra el
 * navegador. Lo recupera al abrir (avisa con `onRecovered`) y lo guarda medio
 * segundo después de dejar de escribir, al salir de la página y, de respaldo,
 * cada 10 s. Devuelve si lo escrito ya quedó guardado.
 */
export function useJournalDraft({
  control,
  getValues,
  reset,
  onRecovered,
}: {
  control: Control<JournalFormValues>;
  getValues: UseFormGetValues<JournalFormValues>;
  reset: UseFormReset<JournalFormValues>;
  onRecovered: () => void;
}): { draftSaved: boolean } {
  const [draftSaved, setDraftSaved] = useState(false);
  const notifyRecovered = useEffectEvent(onRecovered);

  // Al abrir: el borrador solo existe en el navegador, así que se lee después de montar (sin desajuste de hidratación).
  useEffect(() => {
    const draft = loadDraft();
    if (draft && hasText(draft)) {
      reset({ mode: "GUIDED", ...draft });
      notifyRecovered();
    }
    const interval = window.setInterval(() => saveDraft(getValues()), DRAFT_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [getValues, reset]);

  // Al dejar de escribir.
  const values = useWatch({ control });
  useEffect(() => {
    const timer = window.setTimeout(() => setDraftSaved(saveDraft(getValues())), DRAFT_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [values, getValues]);

  // Al salir de la página. pagehide: cerrar la pestaña o el navegador; visibilitychange: cambiar de app o bloquear
  // el celular.
  useEffect(() => {
    const saveNow = () => saveDraft(getValues());
    const onVisibility = () => document.visibilityState === "hidden" && saveNow();
    window.addEventListener("pagehide", saveNow);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pagehide", saveNow);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [getValues]);

  return { draftSaved };
}
