"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "cn";
import { Home, NotebookPen, Sprout, History, User } from "lucide-react";

type NavItem = { href: string; label: string; icon: typeof Home; enabled: boolean };

/** Las 5 pestañas de la navegación del estudiante (sección 2 de Senda/CLAUDE.md). */
const ITEMS: NavItem[] = [
  { href: "/inicio", label: "Inicio", icon: Home, enabled: true },
  { href: "/diario", label: "Diario", icon: NotebookPen, enabled: true },
  { href: "/progreso", label: "Progreso", icon: Sprout, enabled: true },
  { href: "/historial", label: "Historial", icon: History, enabled: true },
  { href: "/perfil", label: "Perfil", icon: User, enabled: true },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-10 flex justify-center border-t border-border bg-card/95 backdrop-blur-sm"
    >
      <div className="flex w-full max-w-md justify-between px-2 py-1.5">
        {ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;
          const content = (
            <span
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-[0.6875rem] font-semibold transition-colors",
                active && "text-bloom-ink",
                !active && item.enabled && "text-muted-foreground",
                !item.enabled && "text-muted-foreground/40",
              )}
            >
              <Icon className="size-5" />
              {item.label}
            </span>
          );

          if (!item.enabled) {
            return (
              <span key={item.href} aria-disabled="true" className="flex-1 cursor-default">
                {content}
              </span>
            );
          }

          return (
            <Link key={item.href} href={item.href} className="flex-1">
              {content}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
