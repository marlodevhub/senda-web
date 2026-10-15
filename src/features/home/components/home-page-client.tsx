"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHome } from "@/features/home/api/use-home";
import { PendingPhraseCard, NoPendingPhrase } from "@/features/home/components/pending-phrase-card";
import { WeeklyGoal } from "@/features/home/components/weekly-goal";
import { CheckIn } from "@/features/home/components/check-in";

/**
 * CU-05 Inicio (RN-IN-01): saludo con "Día N de 28", botón Escribir, frase
 * pendiente (RN-IN-02), meta de la semana (RN-IN-07) y avisos de mensajes
 * nuevos (CU-14) y resumen nuevo (CU-10). En SOLO_LECTURA (RN-IN-06) muestra
 * `inicio.terminaste`, el enlace a la posprueba y los accesos a Progreso e
 * Historial, sin acciones de escritura. El check-in (CU-06) va entre el
 * saludo y el botón Escribir (RN-IN-01) y no se muestra en SOLO_LECTURA.
 */
export function HomePageClient() {
  const t = useTranslations();
  const router = useRouter();
  const { data: home, isPending } = useHome();

  if (isPending || !home) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden />
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
      </div>
    );
  }

  const pending = home.pendingPhrase;

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-heading text-xl font-bold leading-snug text-foreground lg:text-3xl">
        {t("home.greeting", { day: home.day })}
      </h1>

      {home.status === "READ_ONLY" ? (
        <div className="flex flex-col gap-4">
          <p className="text-sm leading-relaxed text-foreground">{t("home.finished")}</p>
          {home.posttestUrl && (
            <Button asChild variant="hero" size="xl">
              <a href={home.posttestUrl} target="_blank" rel="noopener noreferrer">
                {t("home.posttestCta")}
              </a>
            </Button>
          )}
          <div className="flex flex-col gap-2">
            <Button asChild variant="soft">
              <Link href="/progreso">{t("home.goToProgress")}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/historial">{t("home.goToHistory")}</Link>
            </Button>
          </div>
          <HomeNotices newSummary={home.newSummary} />
        </div>
      ) : (
        // Escritorio: a la izquierda lo de hoy (check-in, escribir); a la derecha lo pendiente y la meta.
        <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-start lg:gap-8">
          <div className="flex flex-col gap-5">
            <CheckIn initialMood={home.checkinMood} />

            <Button asChild variant="hero" size="xl">
              <Link href="/diario">{t("home.writeCta")}</Link>
            </Button>
          </div>

          <div className="flex flex-col gap-4">
            {/* El tutorial ilumina aquí el camino a la Reescritura. */}
            <div data-tour="frase-pendiente">
              {pending ? (
                <PendingPhraseCard
                  fragment={pending.fragment}
                  onRewrite={() => router.push(`/reescritura/${pending.journalEntryId}?findingId=${pending.findingId}`)}
                />
              ) : (
                <NoPendingPhrase />
              )}
            </div>

            {home.goal && <WeeklyGoal daysWithEntry={home.goal.daysWithEntry} goal={home.goal.goal} />}

            <HomeNotices newSummary={home.newSummary} />
          </div>
        </div>
      )}
    </div>
  );
}

/** Aviso de resumen nuevo (CU-10). Los mensajes nuevos (CU-14) los avisa el botón de la campana. */
function HomeNotices({ newSummary }: { newSummary: boolean }) {
  const t = useTranslations();
  return (
    <>
      {newSummary && (
        <Link
          href="/progreso"
          className="flex items-center gap-3 rounded-lg bg-card p-4 text-sm font-semibold text-foreground shadow-card"
        >
          {t("home.newSummary")}
        </Link>
      )}
    </>
  );
}
