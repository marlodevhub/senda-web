"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { PenLine, Sprout } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { STUDENT_NAV_ITEMS } from "@/components/layout/student-nav-items";
import { SidebarTools } from "@/components/layout/sidebar-tools";
import { useHome } from "@/features/home/api/use-home";

const INTERVENTION_DAYS = 28;

/**
 * Navegación lateral del estudiante:
 * - Tablet (`md`): riel compacto, solo iconos; el nombre de cada uno sigue
 *   en el árbol de accesibilidad (`sr-only`) y aparece como tooltip.
 * - Escritorio (`lg`): panel completo con el recorrido de 28 días ("tu
 *   senda") y la meta de la semana — en días, nunca un puntaje ni un
 *   porcentaje de mejora (regla de coherencia 1, RN-TR-04).
 */
export function StudentSidebar() {
  const t = useTranslations();
  const pathname = usePathname();
  const { data: home } = useHome();

  const readOnly = home?.status === "READ_ONLY";
  const day = home ? Math.min(Math.max(home.day, 1), INTERVENTION_DAYS) : null;
  const journeyLabel = day !== null ? t("sidebar.dayOf", { day, total: INTERVENTION_DAYS }) : "";

  return (
    <aside className="sticky top-0 z-10 hidden h-screen shrink-0 p-3 md:block md:w-24 lg:w-72 lg:p-4">
      <div className="flex h-full flex-col items-center gap-6 overflow-y-auto rounded-lg bg-card px-2 py-5 shadow-card lg:items-stretch lg:gap-7 lg:p-5">
        <Link
          href="/inicio"
          title="Senda"
          className="flex items-center gap-3 rounded-md focus-visible:outline-2 focus-visible:outline-ring"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[image:var(--grad-dawn)] text-primary-foreground shadow-bloom">
            <Sprout className="size-5" aria-hidden />
          </span>
          <span className="sr-only lg:not-sr-only lg:flex lg:flex-col">
            <span className="font-heading text-2xl leading-none font-extrabold text-foreground">Senda</span>
            <span className="text-xs text-muted-foreground">{t("sidebar.tagline")}</span>
          </span>
        </Link>

        {day !== null && (
          <section
            aria-labelledby="sidebar-journey"
            title={journeyLabel}
            className="flex w-full flex-col items-center gap-2 rounded-md bg-muted p-2 lg:items-stretch lg:p-3.5"
          >
            <div className="flex w-full items-baseline justify-center lg:justify-between">
              <h2
                id="sidebar-journey"
                className="sr-only text-xs font-semibold tracking-wide text-muted-foreground lg:not-sr-only"
              >
                {t("sidebar.journey")}
              </h2>
              {/* Tablet: "3/28"; escritorio: "Día 3 de 28". */}
              <span aria-hidden className="text-sm font-bold tabular-nums text-foreground lg:hidden">
                {day}/{INTERVENTION_DAYS}
              </span>
              <span className="sr-only text-sm font-bold tabular-nums text-foreground lg:not-sr-only">
                {journeyLabel}
              </span>
            </div>
            <div
              role="progressbar"
              aria-labelledby="sidebar-journey"
              aria-valuemin={1}
              aria-valuemax={INTERVENTION_DAYS}
              aria-valuenow={day}
              aria-valuetext={journeyLabel}
              className="h-1.5 w-full overflow-hidden rounded-full bg-background"
            >
              <div
                className="h-full rounded-full bg-[image:var(--grad-dawn)] transition-[width] duration-700 ease-out"
                style={{ width: `${(day / INTERVENTION_DAYS) * 100}%` }}
              />
            </div>
          </section>
        )}

        {!readOnly && (
          <Button
            asChild
            variant="hero"
            size="lg"
            title={t("home.writeCta")}
            className="size-12 rounded-full p-0 lg:h-auto lg:w-full lg:rounded-[var(--radius-md)] lg:px-4 lg:py-2.5"
          >
            <Link href="/diario">
              <PenLine className="size-5 lg:size-4" aria-hidden />
              <span className="sr-only lg:not-sr-only">{t("home.writeCta")}</span>
            </Link>
          </Button>
        )}

        <nav aria-label={t("nav.label")} className="flex w-full flex-col items-center gap-1 lg:items-stretch">
          {STUDENT_NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;
            const label = t(item.labelKey);
            return (
              <Link
                key={item.href}
                href={item.href}
                data-tour={item.href.slice(1)}
                title={label}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex size-12 items-center justify-center rounded-md text-[0.9375rem] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-ring",
                  "lg:min-h-11 lg:w-full lg:justify-start lg:gap-3 lg:px-3",
                  active
                    ? "bg-bloom-tint text-bloom-ink"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="size-5" aria-hidden />
                <span className="sr-only lg:not-sr-only lg:flex-1">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Al pie: la meta de la semana y, a su derecha, los atajos (tutorial, modo día/noche). */}
        <div className="mt-auto flex w-full flex-col items-center gap-3 border-t border-border pt-4 lg:flex-row lg:items-end lg:justify-between">
          {home?.goal && (
            <section
              aria-labelledby="sidebar-goal"
              title={t("sidebar.goalShort", { days: home.goal.daysWithEntry, goal: home.goal.goal })}
              className="flex flex-col items-center gap-2 lg:items-stretch"
            >
              <h2
                id="sidebar-goal"
                className="sr-only text-xs font-semibold tracking-wide text-muted-foreground lg:not-sr-only"
              >
                {t("home.goalLabel")}
              </h2>
              <div className="flex flex-col items-center gap-1.5 lg:flex-row lg:gap-2">
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
                <span className="sr-only text-sm text-foreground lg:not-sr-only lg:ml-1">
                  {home.goal.daysWithEntry >= home.goal.goal ? (
                    t("home.goalMet")
                  ) : (
                    // "0 de 3 días" en una sola línea, junto a los atajos.
                    <span className="whitespace-nowrap">
                      {t("sidebar.goalShort", { days: home.goal.daysWithEntry, goal: home.goal.goal })}
                    </span>
                  )}
                </span>
              </div>
            </section>
          )}
          <SidebarTools className="flex-col lg:ms-auto lg:flex-row" />
        </div>
      </div>
    </aside>
  );
}
