"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { PenLine, Sprout } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { MESSAGES_NAV_ITEM, STUDENT_NAV_ITEMS, type StudentNavItem } from "@/components/layout/student-nav-items";
import { useHome } from "@/features/home/api/use-home";

const INTERVENTION_DAYS = 28;

/**
 * Escritorio (`lg`): panel lateral flotante. Muestra el recorrido de 28 días
 * como avance en días ("tu senda") y la meta de la semana en días — nunca un
 * puntaje ni un porcentaje de mejora (regla de coherencia 1, RN-TR-04).
 */
export function StudentSidebar() {
  const t = useTranslations();
  const pathname = usePathname();
  const { data: home } = useHome();

  const readOnly = home?.status === "READ_ONLY";
  const day = home ? Math.min(Math.max(home.day, 1), INTERVENTION_DAYS) : null;
  const items: StudentNavItem[] = [...STUDENT_NAV_ITEMS.slice(0, 4), MESSAGES_NAV_ITEM, STUDENT_NAV_ITEMS[4]];

  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 p-4 lg:block">
      <div className="flex h-full flex-col gap-7 overflow-y-auto rounded-lg bg-card p-5 shadow-card">
        <Link href="/inicio" className="flex items-center gap-3 rounded-md focus-visible:outline-2 focus-visible:outline-ring">
          <span className="flex size-10 items-center justify-center rounded-full bg-[image:var(--grad-dawn)] text-primary-foreground shadow-bloom">
            <Sprout className="size-5" aria-hidden />
          </span>
          <span className="flex flex-col">
            <span className="font-heading text-2xl leading-none font-extrabold text-foreground">Senda</span>
            <span className="text-xs text-muted-foreground">{t("sidebar.tagline")}</span>
          </span>
        </Link>

        {day !== null && (
          <section aria-labelledby="sidebar-journey" className="flex flex-col gap-2 rounded-md bg-muted p-3.5">
            <div className="flex items-baseline justify-between">
              <h2 id="sidebar-journey" className="text-xs font-semibold tracking-wide text-muted-foreground">
                {t("sidebar.journey")}
              </h2>
              <span className="text-sm font-bold tabular-nums text-foreground">
                {t("sidebar.dayOf", { day, total: INTERVENTION_DAYS })}
              </span>
            </div>
            <div
              role="progressbar"
              aria-labelledby="sidebar-journey"
              aria-valuemin={1}
              aria-valuemax={INTERVENTION_DAYS}
              aria-valuenow={day}
              className="h-1.5 overflow-hidden rounded-full bg-background"
            >
              <div
                className="h-full rounded-full bg-[image:var(--grad-dawn)] transition-[width] duration-700 ease-out"
                style={{ width: `${(day / INTERVENTION_DAYS) * 100}%` }}
              />
            </div>
          </section>
        )}

        {!readOnly && (
          <Button asChild variant="hero" size="lg" className="w-full">
            <Link href="/diario">
              <PenLine className="size-4" aria-hidden />
              {t("home.writeCta")}
            </Link>
          </Button>
        )}

        <nav aria-label={t("nav.label")} className="flex flex-col gap-1">
          {items.map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;
            const unread = item.href === MESSAGES_NAV_ITEM.href && home?.newMessages;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative flex min-h-11 items-center gap-3 rounded-md px-3 text-[0.9375rem] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-ring",
                  active ? "bg-bloom-tint text-bloom-ink" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {active && (
                  <span aria-hidden className="absolute top-2 bottom-2 left-0 w-1 rounded-full bg-[image:var(--grad-dawn)]" />
                )}
                <Icon className="size-5" aria-hidden />
                <span className="flex-1">{t(item.labelKey)}</span>
                {unread && (
                  <span className="size-2 rounded-full bg-bloom">
                    <span className="sr-only">{t("sidebar.newMessages")}</span>
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {home?.goal && (
          <section aria-labelledby="sidebar-goal" className="mt-auto flex flex-col gap-2 border-t border-border pt-4">
            <h2 id="sidebar-goal" className="text-xs font-semibold tracking-wide text-muted-foreground">
              {t("home.goalLabel")}
            </h2>
            <div className="flex items-center gap-2">
              {Array.from({ length: home.goal.goal }, (_, index) => (
                <span
                  key={index}
                  aria-hidden
                  className={cn(
                    "size-3 rounded-full",
                    index < home.goal!.daysWithEntry ? "bg-sprout" : "border border-border bg-background",
                  )}
                />
              ))}
              <span className="ml-1 text-sm text-foreground">
                {home.goal.daysWithEntry >= home.goal.goal
                  ? t("home.goalMet")
                  : t("sidebar.goalShort", { days: home.goal.daysWithEntry, goal: home.goal.goal })}
              </span>
            </div>
          </section>
        )}
      </div>
    </aside>
  );
}
