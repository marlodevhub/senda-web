import { useTranslations } from "next-intl";
import { Droplets, Flower2, Lamp, Sparkles, Sprout } from "lucide-react";
import type { Garden } from "@/features/progress/api/get-garden";
import { GardenScene } from "@/features/progress/components/garden-scene";

const ZONES = [
  { id: "raices", nameKey: "progress.garden.raices", dimensionKey: "progress.garden.dimRaices", textKey: "progress.garden.zoneRaices" },
  { id: "flores", nameKey: "progress.garden.flores", dimensionKey: "progress.garden.dimFlores", textKey: "progress.garden.zoneFlores" },
  { id: "ritmo", nameKey: "progress.garden.ritmo", dimensionKey: "progress.garden.dimRitmo", textKey: "progress.garden.zoneRitmo" },
] as const;

const SPECIAL_CONFIG: Record<string, { icon: typeof Lamp; labelKey: string }> = {
  S1: { icon: Sparkles, labelKey: "progress.garden.specialS1" },
  S2: { icon: Lamp, labelKey: "progress.garden.specialS2" },
  S3: { icon: Flower2, labelKey: "progress.garden.specialS3" },
  S4: { icon: Droplets, labelKey: "progress.garden.specialS4" },
};

/** Pétalos que caen sobre el cielo (decorativos; quietos si se pide menos movimiento). */
const PETALS = [
  { left: "12%", delay: "0s", duration: "9s", color: "var(--bloom)" },
  { left: "34%", delay: "-3s", duration: "11s", color: "var(--garden-sun)" },
  { left: "58%", delay: "-6s", duration: "10s", color: "var(--bloom-tint)" },
  { left: "76%", delay: "-1.5s", duration: "12s", color: "var(--garden-sun)" },
  { left: "90%", delay: "-8s", duration: "9.5s", color: "var(--flow-tint)" },
];

/**
 * CU-07 Jardín: capa general (lluvia y pasto), 3 zonas que crecen por
 * dimensión y los elementos especiales de cada meta semanal (RN-PR-01/02).
 * Describe, no califica: sin puntajes ni comparaciones (RN-PR-05), y nunca
 * se marchita (RN-PR-04). Presentacional — `GardenPageClient` carga los datos.
 */
export function GardenView({ garden }: { garden: Garden }) {
  const t = useTranslations();
  const isEmpty = garden.general.elements === 0;

  return (
    <section aria-labelledby="garden-title" className="garden-scene relative isolate overflow-hidden rounded-[1.75rem] shadow-card">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-72 overflow-hidden">
        {PETALS.map((petal) => (
          <span
            key={petal.left}
            className="garden-petal absolute top-0 h-2.5 w-4 rounded-[60%_40%_60%_40%]"
            style={{ left: petal.left, background: petal.color, animationDelay: petal.delay, animationDuration: petal.duration }}
          />
        ))}
      </div>

      <header className="relative flex items-start justify-between gap-4 px-5 pt-6 md:px-8 md:pt-8">
        <div>
          <h2 id="garden-title" className="font-heading text-3xl leading-none font-extrabold text-(--garden-sky-ink) md:text-4xl">
            {t("progress.garden.heading")}
          </h2>
          <p className="mt-1.5 text-sm text-(--garden-sky-ink)">{t("progress.garden.never")}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm whitespace-nowrap text-(--garden-sky-ink)">{t("progress.garden.stageLabel")}</p>
          <p className="font-heading text-xl font-extrabold whitespace-nowrap text-(--garden-sky-ink) md:text-2xl">
            {t("progress.garden.stageName", { stage: garden.general.stage })}
          </p>
        </div>
      </header>

      <div className="relative mx-auto -mt-2 max-w-2xl">
        <GardenScene garden={garden} />
      </div>

      <div className="relative -mt-px bg-[linear-gradient(to_bottom,var(--garden-hill-mid),var(--garden-hill-deep)_45%,var(--garden-hill-deep))] px-5 pt-2 pb-8 text-center text-(--garden-panel-ink) md:px-8">
        {isEmpty ? (
          <p className="mx-auto max-w-xs py-4 text-base font-semibold">{t("progress.garden.empty")}</p>
        ) : (
          <>
            <p className="text-base font-semibold">{t("progress.garden.wateredTitle")}</p>
            <p className="mt-1 font-heading leading-none font-extrabold text-(--garden-panel-accent)">
              <span className="text-6xl">{garden.general.elements}</span>{" "}
              <span className="text-3xl">{t("progress.garden.wateredUnit", { count: garden.general.elements })}</span>
            </p>
            <p className="mx-auto mt-2 max-w-sm text-sm">{t("progress.garden.wateredBody")}</p>
          </>
        )}

        <ul className="mt-8 grid gap-6 text-left md:grid-cols-3 md:gap-5">
          {ZONES.map((zone) => {
            const data = garden[zone.id];
            return (
              <li key={zone.id} className="relative pl-6">
                <Sparkles aria-hidden className="absolute top-0.5 -left-1.5 size-4 text-(--garden-panel-accent)" />
                <span aria-hidden className="absolute top-6 bottom-0 left-0.5 w-px bg-(--garden-panel-accent)/60" />
                <h3 className="font-heading text-xl font-bold">{t(zone.nameKey)}</h3>
                <p className="text-xs font-semibold tracking-wide uppercase opacity-90">{t(zone.dimensionKey)}</p>
                <p className="mt-2 text-sm">{t(zone.textKey)}</p>
                <p className="mt-2 text-sm font-semibold text-(--garden-panel-accent)">
                  {t("progress.garden.stageName", { stage: data.stage })} ·{" "}
                  {t("progress.garden.zoneElements", { count: data.elements })}
                </p>
              </li>
            );
          })}
        </ul>

        {garden.especiales.length > 0 && (
          <div className="mt-8 flex flex-col items-center gap-3">
            <h3 className="text-sm font-semibold">{t("progress.garden.specialsTitle")}</h3>
            <ul className="flex flex-wrap justify-center gap-2">
              {garden.especiales.map((code) => {
                const config = SPECIAL_CONFIG[code];
                if (!config) return null;
                const Icon = config.icon;
                return (
                  <li
                    key={code}
                    className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold ring-1 ring-white/25"
                  >
                    <Icon className="size-3.5" aria-hidden />
                    {t(config.labelKey)}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <p aria-hidden className="mt-10 flex items-center justify-center gap-1.5 font-heading text-lg font-bold opacity-60">
          <Sprout className="size-5" />
          Senda
        </p>
      </div>
    </section>
  );
}
