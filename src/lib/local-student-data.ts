import { clearDraft } from "@/features/journal/draft";
import { clearNotifiedIds } from "@/features/guidance/notified-messages";
import { clearFieldTexts } from "@/lib/field-texts-cache";

/**
 * Privacidad en dispositivos compartidos: al cerrar sesión o al perderla, se
 * borra todo texto del estudiante que haya quedado en el navegador (el
 * borrador del Diario, los textos que usa el Espejo y qué mensajes ya se
 * avisaron).
 */
export function clearLocalStudentData(): void {
  clearDraft();
  clearFieldTexts();
  clearNotifiedIds();
}
