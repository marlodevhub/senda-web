"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { BookOpen, Feather, Sparkles } from "lucide-react";
import { PillTabs } from "@/components/layout/pill-tabs";

const PENDING_HREF = "/historial/por-reescribir";
const REWRITTEN_HREF = "/historial/reescritos";

/** CU-11: todo lo escrito ("Mis registros"), lo que falta reescribir y lo que ya reescribiste. */
export function HistoryTabs() {
  const pathname = usePathname();
  const t = useTranslations();

  return (
    <PillTabs
      label={t("history.title")}
      tone="ember"
      iconsOnMobile={false}
      tabs={[
        { href: "/historial", label: t("history.tabAll"), icon: BookOpen, active: pathname === "/historial" },
        { href: PENDING_HREF, label: t("history.tabPending"), icon: Feather, active: pathname === PENDING_HREF },
        {
          href: REWRITTEN_HREF,
          label: t("history.tabRewritten"),
          icon: Sparkles,
          active: pathname === REWRITTEN_HREF,
        },
      ]}
    />
  );
}
