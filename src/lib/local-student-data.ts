import { clearFieldTexts } from "@/lib/field-texts-cache";

/**
 * Claves del almacenamiento local que guardan datos de un estudiante. Viven aquí (compartido) para que cada módulo
 * use la suya y este archivo pueda borrarlas todas sin depender de los módulos (las dependencias van de features a
 * lib, nunca al revés).
 */
export const STUDENT_STORAGE_KEYS = {
  /** RS-DI-03: el borrador del Diario. */
  journalDraft: "senda:journal-draft",
  /** Qué mensajes ya se avisaron con un toast (solo ids). */
  notifiedMessages: "senda:notified-messages",
} as const;

/**
 * Privacidad en dispositivos compartidos: al cerrar sesión o al perderla, se
 * borra todo texto del estudiante que haya quedado en el navegador (el
 * borrador del Diario, los textos que usa el Espejo y qué mensajes ya se
 * avisaron).
 */
export function clearLocalStudentData(): void {
  try {
    for (const key of Object.values(STUDENT_STORAGE_KEYS)) {
      window.localStorage.removeItem(key);
    }
  } catch {
    // Sin almacenamiento no hay nada que borrar.
  }
  clearFieldTexts();
}
