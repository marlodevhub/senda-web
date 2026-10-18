"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHome } from "@/features/home/api/use-home";
import { PendingPhraseCard, PendingPhraseList, NoPendingPhrase } from "@/features/home/components/pending-phrase-card";
import { GoalRing } from "@/features/home/components/goal-ring";
import { MoodWeek } from "@/features/home/components/mood-week";
import { WeekOverview } from "@/features/home/components/week-overview";
import { CheckIn } from "@/features/home/components/check-in";
import { TodayMirrorCard } from "@/features/home/components/today-mirror-card";
import { routes } from "@/lib/routes";
import { formatTodayLima } from "@/lib/format/dates";

/**
 * CU-05 Inicio (RN-IN-01): saludo con "Día N de 28", botón Escribir, frase
 * pendiente (RN-IN-02), meta de la semana (RN-IN-07) y avisos de mensajes
 * nuevos (CU-14) y resumen nuevo (CU-10). En SOLO_LECTURA (RN-IN-06) muestra
 * `inicio.terminaste`, el enlace a la posprueba y los accesos a Progreso e
 * Historial, sin acciones de escritura. La semana va como calendario con la
 * meta y el ánimo de cada día. El check-in (CU-06) va tras el saludo y,
 * al marcar una cara, trae el botón Escribir (RN-IN-01); no se muestra en SOLO_LECTURA.
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

  const weekCalendar = (
    <WeekOverview
      week={home.week}
      days={home.weekDays}
      journeyDays={home.journeyDays ?? []}
      today={home.day}
      goal={home.goal}
    />
  );

  return (
    <div className="flex flex-col gap-5">
      {/* El saludo grande con la fecha de hoy a la derecha (el día de la senda va en la tarjeta del calendario). */}
      <header>
        {/* md:pr-16: desde tablet la campana flota arriba a la derecha; la fecha queda a su izquierda. */}
        <div className="flex items-start justify-between gap-3 md:pr-16">
          <h1 className="font-heading text-3xl leading-tight font-bold text-foreground lg:text-4xl">
            {home.preferredName
              ? t.rich("home.greetingNamed", {
                  name: home.preferredName,
                  // El nombre en negrita y en el acento del tema (rojo, o azul con el tema "ocean").
                  highlight: (chunks) => <span className="font-extrabold text-(--prompt-red)">{chunks}</span>,
                })
              : t("home.greeting")}
          </h1>
          {/* Corta en móvil ("Sáb, 17 oct."), larga en escritorio. */}
          <p className="mt-2 shrink-0 text-base whitespace-nowrap text-muted-foreground first-letter:uppercase lg:mt-3">
            <span className="lg:hidden">{formatTodayLima({ weekday: "short", day: "numeric", month: "short" })}</span>
            <span className="hidden lg:inline">
              {formatTodayLima({ weekday: "long", day: "numeric", month: "long" })}
            </span>
          </p>
        </div>
      </header>

      {home.status === "READ_ONLY" ? (
        <div className="flex flex-col gap-4">
          <p className="text-base leading-relaxed text-foreground">{t("home.finished")}</p>
          {home.posttestUrl && (
            <Button asChild variant="hero" size="xl">
              <a href={home.posttestUrl} target="_blank" rel="noopener noreferrer">
                {t("home.posttestCta")}
              </a>
            </Button>
          )}
          {weekCalendar}
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
        // Escritorio: lo de hoy (check-in con escribir, frase pendiente) y la meta y el ánimo; el calendario va en un
        // panel vertical fijo al borde derecho, flotante como la barra lateral (el layout le deja su espacio).
        // @container: las columnas dependen del ancho real del contenido (el panel del calendario le quita espacio),
        // no de la pantalla. Si no entran, todo va apilado: el check-in, la frase y, debajo, la meta y el ánimo.
        <div className="flex flex-col gap-5">
          <div className="@container">
            <div className="flex flex-col gap-5 @[42rem]:grid @[42rem]:grid-cols-[minmax(0,1fr)_16rem] @[42rem]:items-start @[56rem]:grid-cols-[minmax(0,1fr)_18rem]">
              <div className="flex flex-col gap-5">
                {/* El botón Escribir aparece dentro del check-in al marcar una cara. */}
                <CheckIn initialMood={home.checkinMood} />

                {/* Si hoy escribió, el acceso a su Espejo de hoy. */}
                {home.todayEntry && <TodayMirrorCard entry={home.todayEntry} />}

                {/* El tutorial ilumina aquí el camino a la Reescritura. */}
                <div data-tour="frase-pendiente">
                  {/* Móvil y tablet: la frase más reciente; escritorio: todas, cada una lleva a Reescribir. */}
                  <div className="lg:hidden">
                    {pending ? (
                      <PendingPhraseCard
                        fragment={pending.fragment}
                        onRewrite={() => router.push(routes.rewrite(pending.journalEntryId, pending.findingId))}
                      />
                    ) : (
                      <NoPendingPhrase />
                    )}
                  </div>
                  <div className="hidden lg:block">
                    {(home.pendingPhrases ?? []).length > 0 ? (
                      <PendingPhraseList phrases={home.pendingPhrases} />
                    ) : (
                      <NoPendingPhrase />
                    )}
                  </div>
                </div>
                <HomeNotices newSummary={home.newSummary} />
              </div>

              {/* Apiladas, la meta y el ánimo van lado a lado si caben. */}
              <div className="hidden gap-5 lg:grid @[30rem]:grid-cols-2 @[42rem]:grid-cols-1">
                {home.goal && <GoalRing daysWithEntry={home.goal.daysWithEntry} goal={home.goal.goal} />}
                <MoodWeek days={home.weekDays} />
              </div>
            </div>
          </div>

          {/* Fuera del @container: un contenedor de consultas sería el bloque contenedor del panel fijo. */}
          <aside
            data-right-rail
            className="flex flex-col gap-5 lg:fixed lg:inset-y-0 lg:right-0 lg:z-10 lg:w-[22rem] lg:py-5 lg:pr-5 xl:w-[24rem]"
          >
            <div className="lg:h-full lg:overflow-y-auto lg:rounded-lg lg:bg-card lg:shadow-card">{weekCalendar}</div>
            <div className="grid gap-5 sm:grid-cols-2 lg:hidden">
              {home.goal && <GoalRing daysWithEntry={home.goal.daysWithEntry} goal={home.goal.goal} />}
              <MoodWeek days={home.weekDays} />
            </div>
          </aside>
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
          className="flex items-center gap-3 rounded-lg bg-card p-4 text-base font-semibold text-foreground shadow-card"
        >
          {t("home.newSummary")}
        </Link>
      )}
    </>
  );
}
