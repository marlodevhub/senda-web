import { cn } from "cn";
import { Check } from "lucide-react";

export type RewriteOutcome = "SOFTENED" | "ALMOST" | "STILL_HARSH";

const OUTCOME_COPY: Record<
  RewriteOutcome,
  { badge: string; message: string; tone: string }
> = {
  SOFTENED: {
    badge: "Se suavizó",
    message: "Así también se puede hablar contigo.",
    tone: "bg-sprout-tint text-sprout-ink",
  },
  ALMOST: {
    badge: "Casi",
    message: "Vas bien. ¿Quieres probar una versión un poco más amable?",
    tone: "bg-root-tint text-root-ink",
  },
  STILL_HARSH: {
    badge: "Sigue sonando dura",
    message: "Piensa qué le dirías a un amigo y prueba otra vez.",
    tone: "bg-bloom-tint text-bloom-ink",
  },
};

/**
 * Devolución de una reescritura (CU-04, RN-RE-05). Nunca califica ni
 * bloquea — "Sigue sonando dura" en el intento 3 ofrece reescritura.gracias,
 * no un error.
 */
export function RewriteResult({
  outcome,
  before,
  after,
}: {
  outcome: RewriteOutcome;
  before: string;
  after: string;
}) {
  const copy = OUTCOME_COPY[outcome];
  return (
    <div className="flex flex-col gap-3">
      <span
        className={cn(
          "inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold",
          copy.tone
        )}
      >
        <Check className="size-3.5" aria-hidden />
        {copy.badge}
      </span>
      <p className="font-display text-lg leading-snug text-foreground">
        {copy.message}
      </p>
      <p className="text-sm text-muted-foreground line-through decoration-muted-foreground/50 opacity-70 before:content-['“'] after:content-['”']">
        {before}
      </p>
      <p className="rounded-sm bg-card p-3 text-sm font-semibold text-foreground shadow-card before:content-['“'] after:content-['”']">
        {after}
      </p>
    </div>
  );
}
