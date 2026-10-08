"use client";

import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { useMessages } from "@/features/guidance/api/use-messages";
import { MessageCard } from "@/features/guidance/components/message-card";

/** CU-14 Leer mensajes: del más reciente al más antiguo (RN-AA-16), sin leídos resaltados. */
export function MessageInbox() {
  const t = useTranslations();
  const { data: messages, isPending, isError } = useMessages();

  if (isPending) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden />
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
      </div>
    );
  }

  if (isError) {
    return <p className="py-10 text-center text-sm text-muted-foreground">{t("common.unexpectedError")}</p>;
  }

  if (messages.length === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">{t("guidance.empty")}</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {messages.map((message) => (
        <MessageCard key={message.id} message={message} />
      ))}
    </div>
  );
}
