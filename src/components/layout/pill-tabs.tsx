"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type PillTab = { href: string; label: string; icon: LucideIcon; active: boolean };

/**
 * Pestañas en píldora (Progreso, Historial), como la de Guiado/Libre del Diario, en los verdes del jardín
 * (--leaf-*, con su versión para el modo oscuro). Cada pestaña es una ruta.
 */
export function PillTabs({ label, tabs }: { label: string; tabs: PillTab[] }) {
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
            "flex flex-1 items-center justify-center gap-2 rounded-full py-2.5 text-base font-semibold transition-all focus-visible:outline-2 focus-visible:outline-ring",
            active
              ? "bg-[linear-gradient(135deg,var(--leaf-from),var(--leaf-to))] text-(--leaf-ink) shadow-card"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Icon className="size-4" aria-hidden />
          {tabLabel}
        </Link>
      ))}
    </div>
  );
}
