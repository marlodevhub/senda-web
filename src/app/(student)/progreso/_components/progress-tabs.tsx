"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Amphora, ChartColumn, Sprout } from "lucide-react";
import { PillTabs } from "@/components/layout/pill-tabs";

const TABS = [
  { href: "/progreso/jardin", labelKey: "progress.tabGarden", icon: Sprout },
  { href: "/progreso/datos", labelKey: "progress.tabStats", icon: ChartColumn },
  { href: "/progreso/frasco", labelKey: "progress.tabJar", icon: Amphora },
] as const;

/** CU-07/CU-08/CU-09: cambia entre Jardín, Mis datos y Frasco sin salir de Progreso. */
export function ProgressTabs() {
  const pathname = usePathname();
  const t = useTranslations();

  return (
    <PillTabs
      label={t("progress.title")}
      tabs={TABS.map((tab) => ({ ...tab, label: t(tab.labelKey), active: pathname.startsWith(tab.href) }))}
    />
  );
}
