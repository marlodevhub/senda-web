import { cn } from "cn";
import type { Dimension } from "@/types/dimension";

const DIMENSION_STYLE: Record<Dimension, string> = {
  D1: "bg-root-tint text-root-ink",
  D2: "bg-bloom-tint text-bloom-ink",
  D3: "bg-flow-tint text-flow-ink",
};

/**
 * Fragmento resaltado del Espejo (CU-03) o del detalle del historial
 * (CU-11): el texto que escribió el estudiante + su etiqueta amable
 * (RN-ES-13) — nunca el nombre técnico del patrón, siempre la etiqueta
 * en lenguaje natural. Compartido porque lo usan `analysis` y `journal`.
 */
export function FindingCard({
  fragment,
  label,
  dimension,
}: {
  fragment: string;
  label: string;
  dimension: Dimension;
}) {
  return (
    <div className={cn("rounded-sm p-3 text-sm font-semibold leading-snug", DIMENSION_STYLE[dimension])}>
      <p className="before:content-['“'] after:content-['”']">{fragment}</p>
      <p className="mt-1.5 text-xs font-bold uppercase tracking-wide opacity-85">
        {label}
      </p>
    </div>
  );
}
