import type { Message } from "@/features/guidance/api/get-messages";
import { STUDENT_STORAGE_KEYS } from "@/lib/local-student-data";

/**
 * Qué mensajes ya se avisaron con un toast en este dispositivo, para avisar
 * cada uno una sola vez. Solo guarda ids (nunca texto) y se borra al cerrar
 * sesión (`clearLocalStudentData`).
 */
const NOTIFIED_KEY = STUDENT_STORAGE_KEYS.notifiedMessages;
/** Basta con recordar los más recientes: la bandeja de 28 días nunca llega a tanto. */
const MAX_REMEMBERED = 100;

/** Mensajes sin abrir que todavía no se avisaron, del más reciente al más antiguo. */
export function pickUnnotified(messages: Message[], notifiedIds: ReadonlySet<number>): Message[] {
  return messages.filter((message) => !message.opened && !notifiedIds.has(message.id));
}

export function loadNotifiedIds(): Set<number> {
  try {
    const raw = window.localStorage.getItem(NOTIFIED_KEY);
    const ids = raw ? (JSON.parse(raw) as unknown) : [];
    return new Set(Array.isArray(ids) ? ids.filter((id): id is number => typeof id === "number") : []);
  } catch {
    return new Set();
  }
}

export function saveNotifiedIds(ids: Iterable<number>): void {
  try {
    const recent = [...ids].sort((a, b) => b - a).slice(0, MAX_REMEMBERED);
    window.localStorage.setItem(NOTIFIED_KEY, JSON.stringify(recent));
  } catch {
    // Sin almacenamiento: se podría repetir un aviso, nada más.
  }
}
