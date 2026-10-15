"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "light", labelKey: "profile.themeLight", icon: Sun },
  { value: "dark", labelKey: "profile.themeDark", icon: Moon },
  { value: "system", labelKey: "profile.themeSystem", icon: Monitor },
] as const;

/** El tema guardado solo existe en el navegador: hasta montar, no se marca ninguna opción (evita un desajuste de hidratación). */
function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

/**
 * Apariencia: claro, oscuro o según el sistema (por defecto). Se guarda en
 * este dispositivo (next-themes); no viaja al servidor ni a otros equipos.
 */
export function ThemeSelector() {
  const t = useTranslations();
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();

  return (
    <div role="radiogroup" aria-label={t("profile.themeTitle")} className="grid grid-cols-3 gap-2">
      {OPTIONS.map(({ value, labelKey, icon: Icon }) => {
        const active = mounted && theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setTheme(value)}
            className={cn(
              "flex min-h-11 flex-col items-center justify-center gap-1 rounded-md border p-2 text-base font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-ring",
              active ? "border-bloom bg-bloom-tint text-bloom-ink" : "border-border bg-card text-foreground",
            )}
          >
            <Icon className="size-5" aria-hidden />
            {t(labelKey)}
          </button>
        );
      })}
    </div>
  );
}
