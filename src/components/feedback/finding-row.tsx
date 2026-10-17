import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Dimension } from "@/types/dimension";

/** El punto de color de cada dimensión, junto al tipo de frase (naranja Errores, acento Valoración, lila Exigencia). */
export const DIMENSION_DOT: Record<Dimension, string> = {
  D1: "bg-root",
  D2: "bg-bloom",
  D3: "bg-flow",
};

/**
 * Una frase dura detectada (Espejo CU-03, detalle CU-11, Inicio CU-05): el fragmento que escribió el estudiante y, debajo,
 * su tipo en lenguaje amable (RN-ES-13), nunca el nombre técnico del patrón. Con `href` es un acceso a reescribirla
 * (CU-04): crece un poco al pasar el mouse y lleva una flecha. El fondo sigue al tema (rosado; celeste con Hombre).
 */
export function FindingRow({
  fragment,
  label,
  dimension,
  href,
  linkLabel,
}: {
  fragment: string;
  label: string;
  dimension: Dimension;
  href?: string;
  /** Nombre accesible del enlace ("Reescribir: “…”"). */
  linkLabel?: string;
}) {
  const body = (
    <>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="font-display text-base leading-snug font-semibold text-foreground before:content-['“'] after:content-['”']">
          {fragment}
        </span>
        <span className="flex items-start gap-2 text-base leading-snug text-muted-foreground">
          <span aria-hidden className={cn("mt-[0.45rem] size-2 shrink-0 rounded-full", DIMENSION_DOT[dimension])} />
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
      className="group flex items-center gap-3 rounded-md bg-celeste px-4 py-3 transition-[transform,background-color,box-shadow] duration-200 hover:scale-[1.03] hover:bg-celeste-strong hover:shadow-card focus-visible:scale-[1.03] focus-visible:outline-2 focus-visible:outline-ring motion-reduce:transition-none motion-reduce:hover:scale-100"
    >
      {body}
    </Link>
  ) : (
    <div className="flex items-center gap-3 rounded-md bg-celeste px-4 py-3">{body}</div>
  );
}
