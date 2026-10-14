"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Bell, X } from "lucide-react";
import { toast } from "sonner";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { glassStyle, useGlassSettings } from "@/features/appearance/glass-settings";
import { useMessages } from "@/features/guidance/api/use-messages";
import { MessageInbox } from "@/features/guidance/components/message-inbox";
import { loadNotifiedIds, pickUnnotified, saveNotifiedIds } from "@/features/guidance/notified-messages";
import { useMediaQuery } from "@/hooks/use-media-query";

type MessagesCenter = { open: () => void };

const MessagesCenterContext = createContext<MessagesCenter | null>(null);

/**
 * "Mensajes para ti" (CU-14): los mensajes de apoyo de las reglas R2–R7.
 * Una sola bandeja (Drawer) para todas las pantallas: desde abajo en móvil y
 * desde la derecha en tablet y escritorio, sobre el vidrio del dock. Cuando
 * llega un mensaje nuevo se avisa una vez con un toast que abre la bandeja.
 * Las campanas (`MessagesBell`) solo la abren.
 */
export function MessagesCenterProvider({ children }: { children: React.ReactNode }) {
  const t = useTranslations();
  const glass = useGlassSettings();
  const isWide = useMediaQuery("(min-width: 768px)");
  const [isOpen, setIsOpen] = useState(false);
  const { data: messages } = useMessages();

  useEffect(() => {
    if (!messages) {
      return;
    }
    const notified = loadNotifiedIds();
    const fresh = pickUnnotified(messages, notified);
    if (fresh.length === 0) {
      return;
    }
    saveNotifiedIds([...notified, ...fresh.map((message) => message.id)]);
    if (isOpen) {
      return; // Ya los está viendo en la bandeja.
    }
    toast(fresh.length === 1 ? fresh[0].text : t("guidance.toastMany", { count: fresh.length }), {
      icon: <Bell className="size-4" aria-hidden />,
      duration: 8000,
      action: { label: t("guidance.toastOpen"), onClick: () => setIsOpen(true) },
    });
  }, [messages, isOpen, t]);

  return (
    <MessagesCenterContext.Provider value={{ open: () => setIsOpen(true) }}>
      {children}
      <Drawer open={isOpen} onOpenChange={setIsOpen} direction={isWide ? "right" : "bottom"}>
        <DrawerContent
          data-sheen={glass.sheen}
          style={glassStyle(glass)}
          className="glass data-[vaul-drawer-direction=bottom]:max-h-[85vh] data-[vaul-drawer-direction=right]:w-[min(26rem,100vw)] data-[vaul-drawer-direction=right]:sm:max-w-none"
        >
          <DrawerHeader className="flex-row items-center justify-between gap-2 text-left group-data-[vaul-drawer-direction=bottom]/drawer-content:text-left md:pt-6">
            <div className="flex flex-col gap-0.5">
              <DrawerTitle className="text-xl font-bold">{t("guidance.title")}</DrawerTitle>
              <DrawerDescription>{t("guidance.description")}</DrawerDescription>
            </div>
            <DrawerClose
              aria-label={t("guidance.close")}
              className="flex size-11 shrink-0 items-center justify-center rounded-full bg-card text-foreground shadow-card focus-visible:outline-2 focus-visible:outline-ring"
            >
              <X className="size-5" aria-hidden />
            </DrawerClose>
          </DrawerHeader>
          <div className="overflow-y-auto px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            <MessageInbox />
          </div>
        </DrawerContent>
      </Drawer>
    </MessagesCenterContext.Provider>
  );
}

/** Campana con el número de mensajes sin abrir; abre la bandeja. */
export function MessagesBell() {
  const t = useTranslations();
  const glass = useGlassSettings();
  const center = useContext(MessagesCenterContext);
  const { data: messages } = useMessages();
  const unread = messages?.filter((message) => !message.opened).length ?? 0;

  return (
    <button
      type="button"
      onClick={() => center?.open()}
      aria-label={t("guidance.bellLabel", { count: unread })}
      title={t("guidance.title")}
      data-sheen={glass.sheen}
      style={glassStyle(glass)}
      className="glass relative flex size-11 items-center justify-center rounded-full text-foreground focus-visible:outline-2 focus-visible:outline-ring"
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
    </button>
  );
}
