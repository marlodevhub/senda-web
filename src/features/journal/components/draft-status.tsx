"use client";

import { useTranslations } from "next-intl";
import { Cloud, CloudCheck } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { DraftStatus } from "@/features/journal/use-journal-draft";
import { cn } from "@/lib/utils";

/**
 * RS-DI-03: un ícono discreto junto al contador de palabras (gris mientras se escribe, verde al quedar guardado) para
 * no distraer; el texto aparece al pasar el mouse o al enfocarlo con el teclado.
 */
export function DraftStatusIcon({ status, className }: { status: DraftStatus; className?: string }) {
  const t = useTranslations();
  if (status === "empty") {
    return null;
  }
  const saved = status === "saved";
  const label = t(saved ? "journal.draftSaved" : "journal.draftSaving");
  const Icon = saved ? CloudCheck : Cloud;

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            tabIndex={0}
            role="img"
            aria-label={label}
            className={cn(
              "flex size-8 items-center justify-center rounded-full transition-colors duration-500 focus-visible:outline-2 focus-visible:outline-ring",
              saved ? "bg-sprout-tint text-sprout-ink" : "text-muted-foreground",
              className,
            )}
          >
            <Icon className="size-5" aria-hidden />
          </span>
        </TooltipTrigger>
        <TooltipContent side="right" className="text-base">
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
