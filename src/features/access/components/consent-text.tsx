import { cn } from "@/lib/utils";

/** Lo que va antes de ":" al inicio de un párrafo, si es corto, es su título ("Quién puede leer tus textos:"). */
const LEAD_MAX_LENGTH = 60;

/**
 * El texto del consentimiento viene del YAML congelado (PT-02) partido en líneas de ~80 caracteres: los párrafos son
 * los bloques separados por una línea en blanco y dentro de cada uno los saltos son solo del archivo.
 */
function toParagraphs(text: string): { lead: string; body: string }[] {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean)
    .map((paragraph) => {
      const colon = paragraph.indexOf(": ");
      return colon > 0 && colon < LEAD_MAX_LENGTH
        ? { lead: paragraph.slice(0, colon + 1), body: paragraph.slice(colon + 2) }
        : { lead: "", body: paragraph };
    });
}

/** El consentimiento en párrafos que ocupan todo el ancho, con su título en negrita (CU-16 y Perfil). */
export function ConsentText({ text, className }: { text: string; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-3 text-base leading-relaxed text-foreground", className)}>
      {toParagraphs(text).map(({ lead, body }) => (
        <p key={lead + body}>
          {lead && <strong className="font-semibold">{lead} </strong>}
          {body}
        </p>
      ))}
    </div>
  );
}
