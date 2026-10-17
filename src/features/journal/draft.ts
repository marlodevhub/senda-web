import type { JournalFormValues } from "@/features/journal/schemas/journal.schema";
import { STUDENT_STORAGE_KEYS } from "@/lib/local-student-data";

/**
 * RS-DI-03: borrador del Diario en el almacenamiento local del dispositivo.
 * Se guarda al poco de dejar de escribir, al salir de la página (cerrar la
 * pestaña, cambiar de app) y, de respaldo, cada 10 s. Nunca se envía al
 * servidor; se borra al enviar el registro, al cerrar sesión y si la sesión
 * expira (`clearLocalStudentData`).
 */
export const DRAFT_KEY = STUDENT_STORAGE_KEYS.journalDraft;
export const DRAFT_INTERVAL_MS = 10_000;
/** Pausa al escribir tras la que se guarda: si el navegador se cierra, se pierde a lo sumo medio segundo. */
export const DRAFT_DEBOUNCE_MS = 500;

const TEXT_FIELDS = ["q1", "q2", "q3", "freeText"] as const;

export function hasText(values: Partial<JournalFormValues>): boolean {
  return TEXT_FIELDS.some((field) => (values[field] ?? "").trim().length > 0);
}

export function loadDraft(): Partial<JournalFormValues> | null {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as Partial<JournalFormValues>) : null;
  } catch {
    return null;
  }
}

/** Devuelve si quedó un borrador guardado (false si no hay texto o no hay almacenamiento). */
export function saveDraft(values: Partial<JournalFormValues>): boolean {
  try {
    if (hasText(values)) {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(values));
      return true;
    }
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    // Sin almacenamiento (modo privado estricto): simplemente no hay borrador.
  }
  return false;
}

export function clearDraft(): void {
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    // Igual que arriba.
  }
}
