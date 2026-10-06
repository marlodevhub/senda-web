import { useTranslations } from "next-intl";
import { Sparkles, Lamp, Flower2, Droplets, CloudRain } from "lucide-react";
import { GardenZone } from "@/features/progress/components/garden-zone";
import type { Garden } from "@/features/progress/api/get-garden";

const SPECIAL_CONFIG: Record<string, { icon: typeof Lamp; labelKey: string }> = {
  S1: { icon: Lamp, labelKey: "progress.garden.specialS1" },
  S2: { icon: Flower2, labelKey: "progress.garden.specialS2" },
  S3: { icon: Sparkles, labelKey: "progress.garden.specialS3" },
  S4: { icon: Droplets, labelKey: "progress.garden.specialS4" },
};

/**
 * CU-07: capa general + 3 zonas + elementos especiales de semana cumplida.
 * Presentacional — `GardenPageClient` resuelve la carga y los errores.
 */
export function GardenView({ garden }: { garden: Garden }) {
  const t = useTranslations();

  if (garden.general.elements === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">{t("progress.garden.empty")}</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 rounded-md bg-card p-3 shadow-card">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sprout-tint text-sprout-ink">
          <CloudRain className="size-5.5" aria-hidden />
        </div>
        <div>
          <div className="text-sm font-bold text-sprout-ink">{t("progress.garden.general")}</div>
          <div className="text-xs text-muted-foreground">
            {t("progress.garden.stage", { stage: garden.general.stage })}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <GardenZone zone="raices" stage={garden.raices.stage} />
        <p className="px-3 text-xs text-muted-foreground">{t("progress.garden.zoneRaices")}</p>
        <GardenZone zone="flores" stage={garden.flores.stage} />
        <p className="px-3 text-xs text-muted-foreground">{t("progress.garden.zoneFlores")}</p>
        <GardenZone zone="ritmo" stage={garden.ritmo.stage} />
        <p className="px-3 text-xs text-muted-foreground">{t("progress.garden.zoneRitmo")}</p>
      </div>

      {garden.especiales.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-foreground">{t("progress.garden.specialsTitle")}</p>
          <div className="flex flex-wrap gap-2">
            {garden.especiales.map((code) => {
              const config = SPECIAL_CONFIG[code];
              if (!config) return null;
              const Icon = config.icon;
              return (
                <span
                  key={code}
                  className="flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground"
                >
                  <Icon className="size-3.5" aria-hidden />
                  {t(config.labelKey)}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
