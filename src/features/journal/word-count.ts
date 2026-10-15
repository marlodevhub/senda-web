/** RS-DI-02 (mínimo 15 palabras) se valida en el servidor; este conteo solo acompaña mientras se escribe. */
export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
