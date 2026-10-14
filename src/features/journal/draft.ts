import type { JournalFormValues } from "@/features/journal/schemas/journal.schema";

/**
 * RS-DI-03: borrador del Diario en el almacenamiento local del dispositivo
 * (cada 10 s). Nunca se envía al servidor; se borra al enviar el registro,
 * al cerrar sesión y si la sesión expira (`clearLocalStudentData`).
 */
export const DRAFT_KEY = "senda:journal-draft";
export const DRAFT_INTERVAL_MS = 10_000;

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

export function saveDraft(values: Partial<JournalFormValues>): void {
  try {
    if (hasText(values)) {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(values));
    } else {
      window.localStorage.removeItem(DRAFT_KEY);
    }
  } catch {
    // Sin almacenamiento (modo privado estricto): simplemente no hay borrador.
  }
}

export function clearDraft(): void {
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    // Igual que arriba.
  }
}
