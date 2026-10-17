"use client";

import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMounted } from "@/hooks/use-mounted";

const OPTIONS = [
  { value: "light", labelKey: "profile.themeLight", icon: Sun },
  { value: "dark", labelKey: "profile.themeDark", icon: Moon },
  { value: "system", labelKey: "profile.themeSystem", icon: Monitor },
] as const;


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
              "flex min-h-11 touch-manipulation flex-col items-center justify-center gap-1 rounded-2xl p-2 text-base font-semibold transition-[transform,background-color,color] duration-150 select-none [-webkit-tap-highlight-color:transparent] focus-visible:outline-2 focus-visible:outline-ring active:scale-[0.97] motion-reduce:active:scale-100",
              // Elegido: sólido con el color del logo, como el selector de sexo.
              active
                ? "bg-(--prompt-red) text-(--prompt-red-foreground) shadow-sm"
                : "bg-foreground/7 text-foreground hover:bg-foreground/11",
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
