"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  GLASS_DEFAULTS,
  GLASS_LIMITS,
  saveGlassSettings,
  useGlassSettings,
} from "@/features/appearance/glass-settings";

/** Perfil → Apariencia: el vidrio de la barra inferior y del botón de mensajes. Se ve el cambio al instante. */
export function GlassSettingsForm() {
  const t = useTranslations();
  const settings = useGlassSettings();

  return (
    <div className="flex flex-col gap-4">
      <p className="text-base text-muted-foreground">{t("profile.glassHint")}</p>
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between text-base">
          <Label htmlFor="glassOpacity">{t("profile.glassOpacity")}</Label>
          <span className="tabular-nums text-muted-foreground">{settings.opacity} %</span>
        </div>
        <input
          id="glassOpacity"
          type="range"
          {...GLASS_LIMITS.opacity}
          value={settings.opacity}
          onChange={(e) => saveGlassSettings({ ...settings, opacity: Number(e.target.value) })}
          className="h-11 w-full accent-[var(--bloom-ink)]"
        />
      </div>
      <div className="flex items-center gap-3">
        <Checkbox
          id="glassSheen"
          checked={settings.sheen}
          onCheckedChange={(checked) => saveGlassSettings({ ...settings, sheen: checked === true })}
        />
        <Label htmlFor="glassSheen">{t("profile.glassSheen")}</Label>
      </div>
      <Button variant="ghost" className="self-start" onClick={() => saveGlassSettings(GLASS_DEFAULTS)}>
        {t("profile.glassReset")}
      </Button>
    </div>
  );
}
