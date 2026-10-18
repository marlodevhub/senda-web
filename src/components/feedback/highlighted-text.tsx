import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Un tramo a resaltar dentro de un texto: posiciones de inicio y fin (como las manda el backend, RS-ES-06). */
export type HighlightRange = { key: string | number; start: number; end: number; className?: string };

/**
 * Un texto con algunos tramos resaltados (`<mark>`), en el orden en que aparecen; los que se pisan con el anterior se
 * omiten. Lo usan el detalle del registro (CU-11) y la Reescritura (CU-04), para mostrar la frase en su párrafo.
 */
export function HighlightedText({ text, ranges }: { text: string; ranges: HighlightRange[] }) {
  const sorted = [...ranges].sort((a, b) => a.start - b.start);
  const parts: ReactNode[] = [];
  let cursor = 0;
  for (const range of sorted) {
    if (range.start < cursor || range.end > text.length) continue;
    parts.push(text.slice(cursor, range.start));
    parts.push(
      <mark key={range.key} className={cn("rounded-md px-1 py-0.5 box-decoration-clone", range.className)}>
        {text.slice(range.start, range.end)}
      </mark>,
    );
    cursor = range.end;
  }
  parts.push(text.slice(cursor));
  return <>{parts}</>;
}
