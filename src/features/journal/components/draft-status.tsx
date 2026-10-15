"use client";

import { useTranslations } from "next-intl";
import { Check, Cloud } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { DraftStatus } from "@/features/journal/use-journal-draft";
import { cn } from "@/lib/utils";

/**
 * RS-DI-03: una nube discreta junto al contador de palabras; al quedar guardado aparece un check dentro (sin
 * cambiar de color ni moverse, para no distraer). El texto aparece al pasar el mouse o al enfocarlo con el teclado.
 */
export function DraftStatusIcon({ status, className }: { status: DraftStatus; className?: string }) {
  const t = useTranslations();
  if (status === "empty") {
    return null;
  }
  const saved = status === "saved";
  const label = t(saved ? "journal.draftSaved" : "journal.draftSaving");

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            tabIndex={0}
            role="img"
            aria-label={label}
            className={cn(
              "relative flex size-8 items-center justify-center rounded-full text-muted-foreground focus-visible:outline-2 focus-visible:outline-ring",
              className,
            )}
          >
            <Cloud className="size-5" aria-hidden />
            <Check
              aria-hidden
              strokeWidth={3}
              className={cn(
                "absolute top-[55%] left-1/2 size-2.5 -translate-1/2 transition-opacity duration-300",
                saved ? "opacity-100" : "opacity-0",
              )}
            />
          </span>
        </TooltipTrigger>
        <TooltipContent side="right" className="text-base">
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
