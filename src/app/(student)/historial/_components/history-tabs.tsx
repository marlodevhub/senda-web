"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { BookOpen, Feather } from "lucide-react";
import { PillTabs } from "@/components/layout/pill-tabs";

const PENDING_HREF = "/historial/por-reescribir";

/** CU-11: todo lo escrito ("Mis registros") o solo las frases que faltan reescribir. */
export function HistoryTabs() {
  const pathname = usePathname();
  const t = useTranslations();

  return (
    <PillTabs
      label={t("history.title")}
      tone="ember"
      tabs={[
        { href: "/historial", label: t("history.tabAll"), icon: BookOpen, active: pathname === "/historial" },
        { href: PENDING_HREF, label: t("history.tabPending"), icon: Feather, active: pathname === PENDING_HREF },
      ]}
    />
  );
}
