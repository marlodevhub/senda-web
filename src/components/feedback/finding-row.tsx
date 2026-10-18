import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { DIMENSION_CARD, DIMENSION_DOT } from "@/lib/dimension-style";
import type { Dimension } from "@/types/dimension";

/**
 * Una frase dura detectada (Espejo CU-03, detalle CU-11, Inicio CU-05): el fragmento que escribió el estudiante y, debajo,
 * su tipo en lenguaje amable (RN-ES-13), nunca el nombre técnico del patrón. Con `href` es un acceso a reescribirla
 * (CU-04): al pasar el mouse se eleva apenas, con una sombra suave, y lleva una flecha. El fondo es el tono de su dimensión (DIMENSION_CARD).
 */
export function FindingRow({
  fragment,
  label,
  dimension,
  href,
  linkLabel,
  number,
}: {
  fragment: string;
  label: string;
  dimension: Dimension;
  href?: string;
  /** Nombre accesible del enlace ("Reescribir: “…”"). */
  linkLabel?: string;
  /** Su número dentro del registro (1, 2, …): un registro puede tener varias frases. */
  number?: number;
}) {
  const body = (
    <>
      {number !== undefined && (
        <span
          aria-hidden
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-card font-heading text-base font-bold text-bloom-ink tabular-nums"
        >
          {number}
        </span>
      )}
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="font-display text-base leading-snug font-semibold text-foreground before:content-['“'] after:content-['”']">
          {fragment}
        </span>
        <span className="flex items-start gap-2 text-base leading-snug text-muted-foreground">
          <span
            aria-hidden
            className={cn(
              "mt-[0.45rem] size-2 shrink-0 rounded-full",
              DIMENSION_DOT[dimension],
            )}
          />
          {label}
        </span>
      </span>
      {href && (
        <span
          aria-hidden
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[image:var(--grad-hero)] text-white shadow-bloom transition-transform group-hover:translate-x-0.5"
        >
          <ArrowRight className="size-4" />
        </span>
      )}
    </>
  );

  return href ? (
    <Link
      href={href}
      aria-label={linkLabel}
      className={cn(
        "group flex items-center gap-3 rounded-md px-4 py-3 transition-[transform,filter,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:shadow-card hover:brightness-[0.98] focus-visible:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-ring motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        DIMENSION_CARD[dimension],
      )}
    >
      {body}
    </Link>
  ) : (
    <div
      className={cn(
        "flex items-center gap-3 rounded-md px-4 py-3",
        DIMENSION_CARD[dimension],
      )}
    >
      {body}
    </div>
  );
}
