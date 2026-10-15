"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { useWatch, type Control, type UseFormGetValues, type UseFormReset } from "react-hook-form";
import type { JournalFormValues } from "@/features/journal/schemas/journal.schema";
import { DRAFT_DEBOUNCE_MS, DRAFT_INTERVAL_MS, hasText, loadDraft, saveDraft } from "@/features/journal/draft";

/**
 * RS-DI-03: el borrador del Diario, para no perder lo escrito si se cierra el
 * navegador. Lo recupera al abrir (avisa con `onRecovered` solo la primera vez por carga) y lo guarda medio
 * segundo después de dejar de escribir, al salir de la página y, de respaldo,
 * cada 10 s. Devuelve el estado del borrador: sin texto, guardando (se está
 * escribiendo) o guardado.
 */
export type DraftStatus = "empty" | "pending" | "saved";

const RECOVERED_NOTICE_DELAY_MS = 400;

/**
 * El aviso de borrador recuperado sale una vez por carga de la app (al entrar o al recargar la página): este
 * estado del módulo sobrevive a la navegación entre pestañas, así que al volver al Diario el borrador se
 * recupera en silencio.
 */
let recoveredNoticeShown = false;

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
}): DraftStatus {
  // Lo último guardado; si difiere de lo que hay en pantalla, todavía se está escribiendo.
  const [savedSnapshot, setSavedSnapshot] = useState<string | null>(null);
  const notifyRecovered = useEffectEvent(onRecovered);

  // Al abrir: el borrador solo existe en el navegador, así que se lee después de montar (sin desajuste de hidratación).
  useEffect(() => {
    const draft = loadDraft();
    const recovered = draft !== null && hasText(draft);
    if (recovered) {
      reset({ mode: "GUIDED", ...draft });
    }
    // El aviso espera a que la página ya esté pintada: lanzado al cargar, el toast se salta su animación de entrada.
    const notice =
      recovered && !recoveredNoticeShown
        ? window.setTimeout(() => {
            recoveredNoticeShown = true;
            notifyRecovered();
          }, RECOVERED_NOTICE_DELAY_MS)
        : 0;
    const interval = window.setInterval(() => saveDraft(getValues()), DRAFT_INTERVAL_MS);
    return () => {
      window.clearTimeout(notice);
      window.clearInterval(interval);
    };
  }, [getValues, reset]);

  // Al dejar de escribir.
  const values = useWatch({ control });
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const current = getValues();
      setSavedSnapshot(saveDraft(current) ? JSON.stringify(current) : null);
    }, DRAFT_DEBOUNCE_MS);
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

  if (!hasText(values)) {
    return "empty";
  }
  return savedSnapshot === JSON.stringify(getValues()) ? "saved" : "pending";
}
