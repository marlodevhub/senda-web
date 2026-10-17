import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";

export type RewriteOutcome = "SOFTENED" | "ALMOST" | "STILL_HARD";

const OUTCOME_STYLE: Record<
  RewriteOutcome,
  { messageKey: "rewrite.softened" | "rewrite.almost" | "rewrite.stillHard"; tone: string }
> = {
  SOFTENED: { messageKey: "rewrite.softened", tone: "bg-sprout-tint text-sprout-ink" },
  ALMOST: { messageKey: "rewrite.almost", tone: "bg-root-tint text-root-ink" },
  STILL_HARD: { messageKey: "rewrite.stillHard", tone: "bg-bloom-tint text-bloom-ink" },
};

/**
 * Devolución de una reescritura (CU-04, RN-RE-05). Nunca califica ni
 * bloquea — STILL_HARD en el 3er intento ofrece `rewrite.thanks`, no un
 * error.
 */
export function RewriteResult({ outcome, before, after }: { outcome: RewriteOutcome; before: string; after: string }) {
  const t = useTranslations();
  const style = OUTCOME_STYLE[outcome];
  return (
    <div className="flex flex-col gap-3">
      <span
        className={cn("inline-flex size-10 shrink-0 items-center justify-center self-start rounded-full", style.tone)}
      >
        <Check className="size-5" aria-hidden />
      </span>
      <p className="font-display text-lg leading-snug text-foreground">{t(style.messageKey)}</p>
      <p className="font-hand text-base text-muted-foreground line-through decoration-muted-foreground/50 opacity-80 before:content-['“'] after:content-['”'] md:text-lg">
        {before}
      </p>
      <p className="rounded-md bg-sprout-tint px-4 py-3 font-hand text-lg text-sprout-ink before:content-['“'] after:content-['”'] md:text-xl">
        {after}
      </p>
    </div>
  );
}
