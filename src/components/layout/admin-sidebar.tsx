"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { Users2, ClipboardList, LogOut, Sprout, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";

type NavItem = { href: string; label: string; icon: typeof Users2 };

export function AdminSidebar({ onLogout }: { onLogout: () => void }) {
  const t = useTranslations();
  const pathname = usePathname();

  const items: NavItem[] = [
    { href: "/admin/cohortes", label: t("admin.sidebar.cohorts"), icon: Sprout },
    { href: "/admin/participantes", label: t("admin.sidebar.participants"), icon: Users2 },
    { href: "/admin/adherencia", label: t("admin.sidebar.adherence"), icon: ClipboardList },
    { href: "/admin/auditoria", label: t("admin.sidebar.audit"), icon: ScrollText },
  ];

  return (
    <nav
      aria-label="Navegación de administración"
      className="flex h-screen w-56 shrink-0 flex-col justify-between border-r border-border bg-card px-3 py-5"
    >
      <div className="flex flex-col gap-1">
        <span className="px-2 pb-4 font-brand text-lg font-extrabold text-foreground">Senda</span>
        {items.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                active ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
      <Button variant="ghost" className="justify-start gap-2.5 px-2.5" onClick={onLogout}>
        <LogOut className="size-4" />
        {t("admin.logout")}
      </Button>
    </nav>
  );
}
