"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "cn";
import { STUDENT_NAV_ITEMS } from "@/components/layout/student-nav-items";

/** Móvil: las 5 pestañas abajo. Desde `md` la reemplaza `StudentSidebar` (riel en tablet, panel en escritorio). */
export function BottomNav() {
  const pathname = usePathname();
  const t = useTranslations();

  return (
    <nav
      aria-label={t("nav.label")}
      className="fixed inset-x-0 bottom-0 z-10 flex justify-center border-t border-border bg-card/95 backdrop-blur-sm md:hidden"
    >
      <div className="flex w-full max-w-md justify-between px-2 py-1.5">
        {STUDENT_NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className="flex-1"
            >
              <span
                className={cn(
                  "flex flex-1 flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-[0.6875rem] font-semibold transition-colors",
                  active ? "text-bloom-ink" : "text-muted-foreground",
                )}
              >
                <Icon className="size-5" aria-hidden />
                {t(item.labelKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
