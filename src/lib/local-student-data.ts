import { clearDraft } from "@/features/journal/draft";
import { clearFieldTexts } from "@/lib/field-texts-cache";

/**
 * Privacidad en dispositivos compartidos: al cerrar sesión o al perderla, se
 * borra todo texto del estudiante que haya quedado en el navegador (el
 * borrador del Diario y los textos que usa el Espejo).
 */
export function clearLocalStudentData(): void {
  clearDraft();
  clearFieldTexts();
}
