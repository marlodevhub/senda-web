"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "cn";
import type { Message } from "@/features/guidance/api/get-messages";
import { useOpenMessage } from "@/features/guidance/api/use-messages";

const DATE_FORMATTER = new Intl.DateTimeFormat("es-PE", {
  timeZone: "America/Lima",
  day: "numeric",
  month: "short",
});

function actionHref(message: Message): string | null {
  if (message.actionType === "WRITE") {
    return "/diario";
  }
  if (message.actionType === "REWRITE" && message.actionJournalEntryId && message.actionFindingId) {
    return `/reescritura/${message.actionJournalEntryId}?findingId=${message.actionFindingId}`;
  }
  // JAR_PHRASE: CU-09 (Frasco) todavía no se construyó — sin enlace roto (RS-TR).
  return null;
}

/** CU-14: una tarjeta de la bandeja; tocarla la marca como abierta (RS-AA-06). */
export function MessageCard({ message }: { message: Message }) {
  const t = useTranslations();
  const openMutation = useOpenMessage();
  const href = actionHref(message);

  function handleOpen() {
    if (!message.opened) {
      openMutation.mutate(message.id);
    }
  }

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={handleOpen}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleOpen()}
      className={cn(
        "cursor-pointer transition-colors",
        !message.opened && "ring-1 ring-bloom shadow-bloom",
      )}
    >
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm text-foreground">{message.text}</p>
          {!message.opened && <span className="mt-1 size-2 shrink-0 rounded-full bg-bloom" aria-hidden />}
        </div>
        <span className="text-xs text-muted-foreground">{DATE_FORMATTER.format(new Date(message.createdAt))}</span>
        {href && (
          <Button variant="soft" size="sm" className="self-start" asChild>
            <Link href={href} onClick={(e) => e.stopPropagation()}>
              {t(message.actionType === "WRITE" ? "guidance.actionWrite" : "guidance.actionRewrite")}
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
