"use client";

import Link from "next/link";
import { Popover } from "radix-ui";
import { useTranslations } from "next-intl";
import { Bell } from "lucide-react";
import { glassStyle, useGlassSettings } from "@/features/appearance/glass-settings";
import { useMessages } from "@/features/guidance/api/use-messages";
import { MessageCard } from "@/features/guidance/components/message-card";

/** Cuántas tarjetas se muestran en el panel; el resto está en "Ver todos". */
const PREVIEW_COUNT = 4;

/**
 * "Mensajes para ti" (CU-14): los mensajes de apoyo de las reglas R2–R7. Es
 * el único acceso a la bandeja en todas las pantallas (móvil, tablet y
 * escritorio); por eso Inicio y la barra lateral ya no repiten el aviso.
 */
export function MessagesButton() {
  const t = useTranslations();
  const glass = useGlassSettings();
  const { data: messages } = useMessages();
  const unread = messages?.filter((message) => !message.opened).length ?? 0;
  const preview = messages?.slice(0, PREVIEW_COUNT) ?? [];

  return (
    <Popover.Root>
      <Popover.Trigger
        aria-label={t("guidance.bellLabel", { count: unread })}
        title={t("guidance.title")}
        data-sheen={glass.sheen}
        style={glassStyle(glass)}
        className="glass flex size-11 items-center justify-center rounded-full text-foreground focus-visible:outline-2 focus-visible:outline-ring"
      >
        <Bell className="size-5" aria-hidden />
        {unread > 0 && (
          <span
            aria-hidden
            className="absolute -top-1 -right-1 flex min-w-5 items-center justify-center rounded-full bg-bloom-ink px-1 text-[0.6875rem] leading-5 font-bold text-white"
          >
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={10}
          collisionPadding={16}
          aria-label={t("guidance.title")}
          className="z-30 flex max-h-[70vh] w-[min(24rem,calc(100vw-2rem))] flex-col gap-3 overflow-y-auto rounded-lg bg-card p-4 shadow-card"
        >
          <h2 className="font-heading text-lg font-bold text-foreground">{t("guidance.title")}</h2>
          {preview.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">{t("guidance.empty")}</p>
          ) : (
            preview.map((message) => <MessageCard key={message.id} message={message} />)
          )}
          <Popover.Close asChild>
            <Link href="/mensajes" className="self-center rounded-md px-3 py-2 text-sm font-semibold text-bloom-ink underline-offset-4 hover:underline">
              {t("guidance.seeAll")}
            </Link>
          </Popover.Close>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
