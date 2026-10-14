"use client";

import Link from "next/link";
import { Dialog, Popover } from "radix-ui";
import { useTranslations } from "next-intl";
import { Bell, X } from "lucide-react";
import { glassStyle, useGlassSettings } from "@/features/appearance/glass-settings";
import { useMessages } from "@/features/guidance/api/use-messages";
import { MessageCard } from "@/features/guidance/components/message-card";
import { MessageInbox } from "@/features/guidance/components/message-inbox";

/** Cuántas tarjetas se muestran en el panel; el resto está en "Ver todos". */
const PREVIEW_COUNT = 4;

/**
 * "Mensajes para ti" (CU-14): los mensajes de apoyo de las reglas R2–R7. Es
 * el único acceso a la bandeja en todas las pantallas; por eso Inicio y la
 * barra lateral ya no repiten el aviso.
 * - `sheet` (móvil): la bandeja completa a pantalla completa, sobre el mismo
 *   vidrio del dock (opacidad de Perfil → Apariencia, desenfoque de 16 px).
 * - `popover` (tablet y escritorio): panel flotante junto a la campana.
 */
export function MessagesButton({ variant }: { variant: "sheet" | "popover" }) {
  const t = useTranslations();
  const glass = useGlassSettings();
  const { data: messages } = useMessages();
  const unread = messages?.filter((message) => !message.opened).length ?? 0;
  const preview = messages?.slice(0, PREVIEW_COUNT) ?? [];

  const bell = (
    <>
      <Bell className="size-5" aria-hidden />
      {unread > 0 && (
        <span
          aria-hidden
          className="absolute -top-1 -right-1 flex min-w-5 items-center justify-center rounded-full bg-bloom-ink px-1 text-[0.6875rem] leading-5 font-bold text-white"
        >
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </>
  );
  const triggerProps = {
    "aria-label": t("guidance.bellLabel", { count: unread }),
    title: t("guidance.title"),
    "data-sheen": glass.sheen,
    style: glassStyle(glass),
    className:
      "glass relative flex size-11 items-center justify-center rounded-full text-foreground focus-visible:outline-2 focus-visible:outline-ring",
  };

  if (variant === "sheet") {
    return (
      <Dialog.Root>
        <Dialog.Trigger {...triggerProps}>{bell}</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Content
            data-sheen={glass.sheen}
            // Sin borde a pantalla completa: `.glass` vive fuera de las capas de Tailwind y le ganaría a border-0.
            style={{ ...glassStyle(glass), border: "none" }}
            className="glass fixed inset-0 z-40 flex flex-col gap-4 overflow-y-auto px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-8 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0"
          >
            <div className="flex items-center justify-between">
              <Dialog.Title className="font-heading text-xl font-bold text-foreground">{t("guidance.title")}</Dialog.Title>
              <Dialog.Close
                aria-label={t("guidance.close")}
                className="flex size-11 items-center justify-center rounded-full bg-card text-foreground shadow-card focus-visible:outline-2 focus-visible:outline-ring"
              >
                <X className="size-5" aria-hidden />
              </Dialog.Close>
            </div>
            <Dialog.Description className="sr-only">{t("guidance.description")}</Dialog.Description>
            <MessageInbox />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }

  return (
    <Popover.Root>
      <Popover.Trigger {...triggerProps}>{bell}</Popover.Trigger>
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
