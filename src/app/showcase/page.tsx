"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MoodPicker } from "@/features/journal/components/mood-picker";
import type { Mood } from "@/components/icons/mood-face";
import {
  PendingPhraseCard,
} from "@/features/home/components/pending-phrase-card";
import { WeeklyGoal } from "@/features/home/components/weekly-goal";
import { FindingCard } from "@/components/feedback/finding-card";
import {
  ConfirmationPills,
  type ConfirmationAnswer,
} from "@/features/analysis/components/confirmation-pills";
import { RewriteResult } from "@/features/rewrite/components/rewrite-result";
import { GardenZone } from "@/features/progress/components/garden-zone";

function PhoneFrame({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="rounded-[36px] border border-border bg-card p-3.5 shadow-card">
        <div className="flex min-h-[460px] flex-col gap-3.5 overflow-hidden rounded-[24px] bg-muted p-4">
          {children}
        </div>
      </div>
      <p className="text-center text-[0.6875rem] font-bold tracking-wider text-muted-foreground uppercase">
        {label}
      </p>
    </div>
  );
}

export default function ShowcasePage() {
  const [checkInMood, setCheckInMood] = useState<Mood | undefined>(3);
  const [postMood, setPostMood] = useState<Mood | undefined>(4);
  const [confirmation, setConfirmation] = useState<ConfirmationAnswer | undefined>("YES");

  return (
    <main className="mx-auto max-w-7xl px-6 py-14">
      <div className="mb-16 max-w-xl">
        <span className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-bloom-tint px-3.5 py-1.5 text-xs font-bold tracking-wide text-bloom-ink uppercase">
          <span className="size-1.5 rounded-full bg-bloom" />
          senda-web — muestra de componentes
        </span>
        <h1 className="font-display text-3xl leading-tight text-balance text-foreground sm:text-4xl">
          El ciclo diario, con componentes reales.
        </h1>
        <p className="mt-4 text-[1.0625rem] text-muted-foreground">
          Inicio, Diario, Espejo y Devolución — conectados a estado de verdad,
          sobre shadcn/ui extendido con los tokens de Senda.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 xl:grid-cols-4">
        {/* INICIO */}
        <PhoneFrame label="Inicio">
          <span className="w-fit rounded-full bg-card px-2.5 py-1 text-xs font-semibold text-muted-foreground shadow-card tabular-nums">
            Día 9 de 28
          </span>
          <p className="font-display text-xl leading-tight text-foreground">
            Hola. Hoy es tu <span className="text-bloom-ink">día 9</span> de 28.
          </p>
          <WeeklyGoal daysWithEntry={1} />
          <PendingPhraseCard fragment="Siempre arruino todo" />
          <Button variant="outline" size="xl" className="mt-auto w-full">
            Escribir hoy
          </Button>
        </PhoneFrame>

        {/* DIARIO */}
        <PhoneFrame label="Diario">
          <span className="w-fit rounded-full bg-card px-2.5 py-1 text-xs font-semibold text-muted-foreground shadow-card">
            Diario · guiado
          </span>
          <p className="font-display text-lg text-foreground">¿Cómo estás hoy?</p>
          <MoodPicker value={checkInMood} onChange={setCheckInMood} />
          <p className="mt-1 text-[0.8125rem] text-muted-foreground">
            ¿Qué te dijiste a ti mismo?
          </p>
          <div className="flex-1 rounded-md bg-card p-3.5 text-sm text-muted-foreground shadow-card">
            Hoy se me pasó la hora de un examen y pensé que…
          </div>
          <Button variant="hero" size="xl" className="w-full">
            Enviar
          </Button>
        </PhoneFrame>

        {/* ESPEJO */}
        <PhoneFrame label="Espejo">
          <span className="w-fit rounded-full bg-bloom-tint px-2.5 py-1 text-xs font-semibold text-bloom-ink">
            Espejo
          </span>
          <div className="flex flex-col gap-2.5 rounded-md bg-card p-3.5 shadow-card">
            <p className="text-[0.8125rem] text-muted-foreground">
              Gracias por escribir hoy. Esto noté en tu voz interna:
            </p>
            <FindingCard
              fragment="Siempre arruino todo"
              label="Aquí un error se volvió un “siempre”"
              dimension="D1"
            />
            <FindingCard
              fragment="Soy un desastre"
              label="Aquí te hablaste con dureza"
              dimension="D1"
            />
          </div>
          <p className="text-sm font-semibold text-foreground">
            ¿Esto refleja lo que escribiste?
          </p>
          <ConfirmationPills value={confirmation} onChange={setConfirmation} />
          <Button variant="hero" size="xl" className="mt-auto w-full">
            Reescribir esta frase
          </Button>
        </PhoneFrame>

        {/* DEVOLUCIÓN */}
        <PhoneFrame label="Devolución">
          <span className="w-fit rounded-full bg-sprout-tint px-2.5 py-1 text-xs font-semibold text-sprout-ink">
            Devolución
          </span>
          <RewriteResult
            outcome="SOFTENED"
            before="Siempre arruino todo"
            after="Se me pasó esta vez; eso no me define. ¿Qué haría distinto?"
          />
          <p className="mt-1 text-[0.8125rem] text-muted-foreground">
            ¿Cómo te sientes ahora?
          </p>
          <MoodPicker value={postMood} onChange={setPostMood} size="compact" />
          <Button variant="gradient-outline" size="xl" className="mt-auto w-full">
            Guardar en mi frasco ✦
          </Button>
        </PhoneFrame>
      </div>

      <div className="mt-16 max-w-md">
        <h2 className="mb-1 font-display text-xl text-foreground">
          El jardín: 3 dimensiones, 3 colores fijos
        </h2>
        <p className="mb-5 text-sm text-muted-foreground">
          Raíces, Flores y Ritmo nunca intercambian color entre sí en toda la app.
        </p>
        <div className="flex flex-col gap-2.5">
          <GardenZone zone="raices" stage={2} />
          <GardenZone zone="flores" stage={3} />
          <GardenZone zone="ritmo" stage={1} />
        </div>
      </div>
    </main>
  );
}
