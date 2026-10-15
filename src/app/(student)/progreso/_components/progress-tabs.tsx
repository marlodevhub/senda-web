"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/progreso/jardin", labelKey: "progress.tabGarden" },
  { href: "/progreso/datos", labelKey: "progress.tabStats" },
  { href: "/progreso/frasco", labelKey: "progress.tabJar" },
] as const;

/** CU-07/CU-08/CU-09: cambia entre Jardín, Mis datos y Frasco sin salir de Progreso. */
export function ProgressTabs() {
  const pathname = usePathname();
  const t = useTranslations();

  return (
    <div role="tablist" aria-label={t("progress.title")} className="relative z-10 flex gap-1.5 rounded-md bg-muted p-1">
      {TABS.map((tab) => {
        const active = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            role="tab"
            aria-selected={active}
            className={cn(
              "flex-1 rounded-[calc(var(--radius-md)-4px)] py-1.5 text-center text-sm font-semibold transition-colors",
              active ? "bg-card text-foreground shadow-card" : "text-muted-foreground",
            )}
          >
            {t(tab.labelKey)}
          </Link>
        );
      })}
    </div>
  );
}
