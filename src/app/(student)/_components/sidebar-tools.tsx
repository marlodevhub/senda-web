"use client";

import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { CircleHelp, Moon, Sun } from "lucide-react";
import { useTour } from "@/components/tour/app-tour";
import { cn } from "@/lib/utils";
import { useMounted } from "@/hooks/use-mounted";


const TOOL_CLASS =
  "flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring";

/**
 * Atajos al pie de la barra lateral: ver el tutorial y pasar de modo día a modo noche (y al revés). El modo
 * elegido se guarda en este dispositivo, igual que en Perfil (next-themes).
 */
export function SidebarTools({ className }: { className?: string }) {
  const t = useTranslations();
  const tour = useTour();
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();
  const dark = mounted && resolvedTheme === "dark";
  const themeLabel = t(dark ? "sidebar.lightMode" : "sidebar.darkMode");

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      <button
        type="button"
        onClick={() => tour?.start()}
        aria-label={t("profile.seeTour")}
        title={t("profile.seeTour")}
        className={TOOL_CLASS}
      >
        <CircleHelp className="size-5" aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => setTheme(dark ? "light" : "dark")}
        aria-label={themeLabel}
        title={themeLabel}
        className={TOOL_CLASS}
      >
        {dark ? <Sun className="size-5" aria-hidden /> : <Moon className="size-5" aria-hidden />}
      </button>
    </div>
  );
}
