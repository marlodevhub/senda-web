"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "cn";
import { STUDENT_NAV_ITEMS } from "@/components/layout/student-nav-items";
import { glassStyle, useGlassSettings } from "@/features/appearance/glass-settings";

/**
 * Móvil: cápsula flotante de vidrio líquido con las 5 pestañas (opacidad,
 * desenfoque y reflejo se ajustan en Perfil → Apariencia). Desde `md` la
 * reemplaza `StudentSidebar`.
 */
export function BottomNav() {
  const pathname = usePathname();
  const t = useTranslations();
  const glass = useGlassSettings();

  return (
    <nav
      aria-label={t("nav.label")}
      className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex justify-center px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden"
    >
      <div
        data-sheen={glass.sheen}
        style={glassStyle(glass)}
        className="glass pointer-events-auto flex w-full max-w-md justify-between rounded-full px-1.5 py-1.5"
      >
        {STUDENT_NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className="flex-1 rounded-full focus-visible:outline-2 focus-visible:outline-ring"
            >
              <span
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-full px-1 py-1.5 text-[0.6875rem] font-semibold transition-all duration-300",
                  active
                    ? "bg-bloom-tint/80 text-bloom-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]"
                    : "text-foreground/75",
                )}
              >
                <Icon className={cn("size-5 transition-transform duration-300", active && "scale-110")} aria-hidden />
                {t(item.labelKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
