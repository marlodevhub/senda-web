"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Amphora, ChartColumn, Sprout, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS: { href: string; labelKey: string; icon: LucideIcon }[] = [
  { href: "/progreso/jardin", labelKey: "progress.tabGarden", icon: Sprout },
  { href: "/progreso/datos", labelKey: "progress.tabStats", icon: ChartColumn },
  { href: "/progreso/frasco", labelKey: "progress.tabJar", icon: Amphora },
];

/**
 * CU-07/CU-08/CU-09: cambia entre Jardín, Mis datos y Frasco sin salir de
 * Progreso. Píldora como la de Guiado/Libre del Diario, en los verdes del
 * jardín (--leaf-*, con su versión para el modo oscuro).
 */
export function ProgressTabs() {
  const pathname = usePathname();
  const t = useTranslations();

  return (
    <div
      role="tablist"
      aria-label={t("progress.title")}
      className="relative z-10 mx-auto flex w-full max-w-md gap-1 rounded-full bg-card/80 p-1 shadow-card backdrop-blur"
    >
      {TABS.map((tab) => {
        const active = pathname.startsWith(tab.href);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            role="tab"
            aria-selected={active}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-full py-2.5 text-base font-semibold transition-all focus-visible:outline-2 focus-visible:outline-ring",
              active
                ? "bg-[linear-gradient(135deg,var(--leaf-from),var(--leaf-to))] text-(--leaf-ink) shadow-card"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-4" aria-hidden />
            {t(tab.labelKey)}
          </Link>
        );
      })}
    </div>
  );
}
