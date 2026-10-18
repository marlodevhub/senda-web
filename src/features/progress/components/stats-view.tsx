import { useTranslations } from "next-intl";
import type { Stats } from "@/features/progress/api/get-stats";
import { ChartCard } from "@/features/progress/components/chart-card";
import { MoodChart } from "@/features/progress/components/charts/mood-chart";
import { BeforeAfterChart } from "@/features/progress/components/charts/before-after-chart";
import { TransformedChart } from "@/features/progress/components/charts/transformed-chart";
import { VoiceByWeekChart } from "@/features/progress/components/charts/voice-by-week-chart";
import { ByContextChart } from "@/features/progress/components/charts/by-context-chart";
import { ConsistencyChart } from "@/features/progress/components/charts/consistency-chart";
import { DayPartChart } from "@/features/progress/components/charts/day-part-chart";

/**
 * CU-08: los 7 gráficos en el orden de RN-PR-08 (transformadas antes que
 * voz interna). RN-PR-07: con menos de 3 registros completados se
 * muestra `datos.reuniendo` en vez de los gráficos basados en registros;
 * "Mi ánimo" y "Mi día" aparecen antes si ya hay 3 días con registro o
 * check-in (CU-08 1a). Presentacional —
 * `StatsPageClient` resuelve la carga y los errores.
 */
export function StatsView({ stats }: { stats: Stats }) {
  const t = useTranslations();

  const moodCard = (
    <ChartCard title={t("progress.stats.moodTitle")} explanation={t("progress.stats.moodExplanation")}>
      <MoodChart data={stats.mood} />
    </ChartCard>
  );

  const dayPartCard = (
    <ChartCard title={t("progress.stats.dayPartTitle")} explanation={t("progress.stats.dayPartExplanation")} fluid>
      <DayPartChart data={stats.moodByDayPart} />
    </ChartCard>
  );

  if (!stats.hasEnoughData) {
    return (
      <div className="flex flex-col gap-4">
        {stats.hasEnoughMoodData && moodCard}
        {stats.hasEnoughMoodData && dayPartCard}
        <p className="py-10 text-center text-sm text-muted-foreground">{t("progress.stats.notEnoughData")}</p>
      </div>
    );
  }

  // Escritorio: los gráficos en cuadrícula de 2; "Mi ánimo" ocupa el ancho completo arriba y "Mi día" abre la
  // cuadrícula, junto a "Antes y después".
  return (
    <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:gap-5 lg:[&>:first-child]:col-span-2">
      {moodCard}

      {dayPartCard}

      <ChartCard
        title={t("progress.stats.beforeAfterTitle")}
        explanation={t("progress.stats.beforeAfterExplanation")}
      >
        {stats.beforeAfter.length === 0 ? (
          <p className="flex h-full items-center justify-center text-center text-sm text-muted-foreground">
            {t("progress.stats.noPairs")}
          </p>
        ) : (
          <BeforeAfterChart data={stats.beforeAfter} />
        )}
      </ChartCard>

      <ChartCard
        title={t("progress.stats.transformedTitle")}
        explanation={t("progress.stats.transformedExplanation")}
      >
        <TransformedChart data={stats.transformed} />
      </ChartCard>

      <ChartCard
        title={t("progress.stats.voiceByWeekTitle")}
        explanation={t("progress.stats.voiceByWeekExplanation")}
      >
        <VoiceByWeekChart data={stats.voiceByWeek} />
      </ChartCard>

      <ChartCard title={t("progress.stats.byContextTitle")} explanation={t("progress.stats.byContextExplanation")}>
        <ByContextChart data={stats.byContext} />
      </ChartCard>

      <ChartCard
        title={t("progress.stats.consistencyTitle")}
        explanation={t("progress.stats.consistencyExplanation")}
      >
        <ConsistencyChart data={stats.consistency} />
      </ChartCard>
    </div>
  );
}
