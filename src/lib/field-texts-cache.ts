/**
 * Puente cliente-only entre Diario y Espejo: el Espejo necesita el texto
 * de cada campo (q1/q2/q3/freeText) para recortar el fragmento exacto de
 * cada hallazgo (el backend solo manda inicio/fin, no el fragmento —
 * RS-ES-06). Vive solo en sessionStorage, nunca se envía al servidor ni
 * sobrevive más allá de esta pestaña, igual que el borrador (RS-DI-03).
 */
const PREFIX = "senda:entry-field-texts:";

export function saveFieldTexts(journalEntryId: number, texts: Record<string, string>): void {
  try {
    sessionStorage.setItem(`${PREFIX}${journalEntryId}`, JSON.stringify(texts));
  } catch {
    // sessionStorage no disponible (modo privado estricto, etc.): el Espejo
    // seguirá mostrando dimensión y etiqueta, solo sin el fragmento exacto.
  }
}

export function readFieldTexts(journalEntryId: number): Record<string, string> {
  try {
    const raw = sessionStorage.getItem(`${PREFIX}${journalEntryId}`);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}
