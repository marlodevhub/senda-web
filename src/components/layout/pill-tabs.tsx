"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type PillTab = { href: string; label: string; icon: LucideIcon; active: boolean };

const TONES = {
  leaf: "bg-[linear-gradient(135deg,var(--leaf-from),var(--leaf-to))] text-(--leaf-ink)",
  ember: "bg-[linear-gradient(135deg,var(--ember-from),var(--ember-to))] text-(--ember-ink)",
} as const;

/**
 * Pestañas en píldora (Progreso, Historial), como la de Guiado/Libre del Diario. La activa va en un degradado:
 * verde del jardín (`leaf`, Progreso) o naranja (`ember`, Historial), cada uno con su versión para el modo oscuro.
 * Cada pestaña es una ruta.
 */
export function PillTabs({
  label,
  tabs,
  tone = "leaf",
  iconsOnMobile = true,
}: {
  label: string;
  tabs: PillTab[];
  tone?: keyof typeof TONES;
  /** Con nombres largos (Historial) los íconos se ocultan en móvil para que cada nombre quepa en una línea. */
  iconsOnMobile?: boolean;
}) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="relative z-10 mx-auto flex w-full max-w-md gap-1 rounded-full bg-card/80 p-1 shadow-card backdrop-blur"
    >
      {tabs.map(({ href, label: tabLabel, icon: Icon, active }) => (
        <Link
          key={href}
          href={href}
          role="tab"
          aria-selected={active}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-full px-2 py-2.5 text-base font-semibold whitespace-nowrap transition-all focus-visible:outline-2 focus-visible:outline-ring",
            active ? cn(TONES[tone], "shadow-card") : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Icon className={cn("size-4 shrink-0", !iconsOnMobile && "max-sm:hidden")} aria-hidden />
          {tabLabel}
        </Link>
      ))}
    </div>
  );
}
