"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Amphora, Feather, ScanFace, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MoodOrb, type Mood } from "@/components/icons/mood-orb";
import { MoodProgress } from "@/components/feedback/mood-progress";
import { CareMessage } from "@/components/feedback/care-message";
import { FindingRow } from "@/components/feedback/finding-row";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useEntryDetail, useDeleteEntry } from "@/features/journal/api/use-entries";
import type { EntryAnalysisField, EntryRewrite, JournalEntryDetail } from "@/features/journal/api/get-entry-detail";
import { CONTEXT_ICONS } from "@/features/journal/context-icons";
import { DIMENSION_TINT } from "@/lib/dimension-style";
import { sliceFinding, type FieldTexts } from "@/lib/findings";
import { patternLabelKey } from "@/lib/pattern-labels";
import { routes } from "@/lib/routes";
import { BffError } from "@/lib/api/client";
import { errorMessageKey } from "@/lib/api/error-messages";
import { cn } from "@/lib/utils";
import { HighlightedText } from "@/components/feedback/highlighted-text";
import { JOURNAL_CONTEXT_LABEL_KEY } from "@/types/journal-context";

const FIELD_TEXT: Record<EntryAnalysisField, keyof Pick<JournalEntryDetail, "q1" | "q2" | "q3" | "freeText">> = {
  Q1: "q1",
  Q2: "q2",
  Q3: "q3",
  FREE_TEXT: "freeText",
};

/** La fecha del registro (AAAA-MM-DD, día de Lima) como "jueves, 15 de octubre", sin correrla por la zona. */
function formatLongDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("es-PE", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(
    new Date(Date.UTC(year, month - 1, day)),
  );
}

/** Los textos del registro por campo, para recortar sus frases. */
function textsOf(entry: JournalEntryDetail): FieldTexts {
  return { Q1: entry.q1, Q2: entry.q2, Q3: entry.q3, FREE_TEXT: entry.freeText };
}

/**
 * CU-11 Consultar detalle (RN-HI-03/04), CU-12 Eliminar registro (RN-HI-05/06). Con el mismo lenguaje del Diario:
 * arriba el día, el número del registro en ese día, la cara y el contexto; la hoja con la letra manuscrita y las frases
 * duras resaltadas en el tono de su dimensión y, debajo de ella, sus reescrituras; al lado (escritorio) lo que notó el
 * Espejo con el acceso a reescribir el registro. Eliminar queda discreto, al final.
 */
export function EntryDetail({ journalEntryId }: { journalEntryId: number }) {
  const t = useTranslations();
  const { data: entry, isPending } = useEntryDetail(journalEntryId);

  if (isPending || !entry) {
    return <p className="text-center text-base text-muted-foreground">{t("common.loading")}</p>;
  }

  const isRisk = entry.status === "RISK";
  const findings = entry.status === "COMPLETED" && !isRisk ? (entry.mirror?.findings ?? []) : [];
  // CU-04: el registro se reescribe completo; queda reescrito cuando un intento llegó a verde (la IA le puso 4 o 5).
  const entryAttempts = [...entry.rewrites].sort((a, b) => a.attemptNumber - b.attemptNumber);
  // Con reescrituras, se puede reescribir nuevamente (el campo empieza en blanco).
  const canRewrite = !isRisk && entry.status === "COMPLETED" && findings.length > 0;
  const context = entry.context ? CONTEXT_ICONS[entry.context] : null;
  const findingsIn = (field: EntryAnalysisField) => findings.filter((finding) => finding.field === field);

  const answers: { field: EntryAnalysisField; labelKey: string }[] =
    entry.mode === "GUIDED"
      ? [
          { field: "Q1", labelKey: "history.q1Label" },
          { field: "Q2", labelKey: "history.q2Label" },
          { field: "Q3", labelKey: "history.q3Label" },
        ]
      : [{ field: "FREE_TEXT", labelKey: "history.freeTextLabel" }];

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-center gap-4 rounded-lg bg-card p-5 shadow-card">
        <MoodOrb mood={entry.moodBefore as Mood} className="size-14 shrink-0" />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <h1 className="font-heading text-2xl font-bold text-foreground">
            {t("history.entryTitle", { day: entry.interventionDay, number: entry.numberInDay })}
          </h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-base text-muted-foreground">
            <span className="first-letter:uppercase">{formatLongDate(entry.date)}</span>
            {entry.context && context && (
              <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5", context.tone)}>
                <context.icon className="size-4" aria-hidden />
                {t(JOURNAL_CONTEXT_LABEL_KEY[entry.context])}
              </span>
            )}
          </div>
        </div>
        {/*
          CU-03: volver a ver el Espejo completo (con "¿Esto refleja lo que escribiste?"). En móvil va en su propia fila,
          a todo el ancho: al lado apretaba el día y la fecha.
        */}
        {!isRisk && (
          <Button asChild variant="outline" className="w-full rounded-full sm:w-auto">
            <Link href={routes.mirror(entry.id)}>
              <ScanFace className="size-4" aria-hidden />
              {t("history.seeMirror")}
            </Link>
          </Button>
        )}
      </header>

      <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-start lg:gap-6">
        <div className="flex flex-col gap-5">
          {/* La hoja: lo que escribió, con la letra del Diario. */}
          <article
            aria-label={t("history.detailTitle")}
            className="flex flex-col gap-4 rounded-[2rem] bg-card p-6 shadow-card md:p-8"
          >
            {answers.map(({ field, labelKey }) => (
              <section key={field} className="flex flex-col gap-1">
                <h2 className="font-hand text-lg leading-snug font-medium text-(--prompt-red) md:text-xl">
                  {t(labelKey)}
                </h2>
                <p className="font-hand text-base leading-relaxed whitespace-pre-line text-foreground md:text-lg">
                  <HighlightedText
                    text={entry[FIELD_TEXT[field]] ?? ""}
                    ranges={findingsIn(field).map((finding) => ({
                      key: finding.findingId,
                      start: finding.start,
                      end: finding.end,
                      className: DIMENSION_TINT[finding.dimension],
                      badge: findings.indexOf(finding) + 1,
                    }))}
                  />
                </p>
              </section>
            ))}
          </article>

          {!isRisk && entry.rewrites.length > 0 && (
            <section
              aria-labelledby="entry-rewrites"
              className="flex flex-col gap-3 rounded-lg bg-card p-5 shadow-card"
            >
              <h2 id="entry-rewrites" className="font-heading text-lg font-bold text-foreground">
                {t("history.rewritesTitle")}
              </h2>
              {/* La reescritura del registro: el progreso de caritas (que puso la IA) y cada intento. */}
              <EntryRewriteProgress attempts={entryAttempts} />
            </section>
          )}
        </div>

        <div className="flex flex-col gap-5">
          {isRisk && <CareMessage />}

          {!isRisk && entry.status === "COMPLETED" && (
            <section aria-labelledby="entry-mirror" className="flex flex-col gap-3 rounded-lg bg-card p-5 shadow-card">
              <h2 id="entry-mirror" className="font-heading text-lg font-bold text-foreground">
                {t("history.mirrorTitle")}
              </h2>
              {findings.length === 0 ? (
                <p className="text-base text-muted-foreground">{t("history.noFindings")}</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {findings.map((finding, index) => (
                    <li key={finding.findingId}>
                      <FindingRow
                        number={index + 1}
                        fragment={sliceFinding(finding, textsOf(entry))}
                        label={t(patternLabelKey(finding.pattern))}
                        dimension={finding.dimension}
                      />
                    </li>
                  ))}
                </ul>
              )}
              {/* CU-04: todas las frases se reescriben juntas, en una reescritura del registro. */}
              {canRewrite && (
                <Button variant="hero" className="rounded-full sm:self-start" asChild>
                  <Link href={routes.rewrite(entry.id)}>
                    <Feather className="size-4" aria-hidden />
                    {t(entryAttempts.length > 0 ? "analysis.rewriteEntryAgain" : "analysis.rewriteThisEntry")}
                  </Link>
                </Button>
              )}
            </section>
          )}

          <DeleteEntry journalEntryId={entry.id} />
        </div>
      </div>
    </div>
  );
}

/** La reescritura del registro completo: la fila de caritas de cada intento y, debajo, cada intento con su texto. */
function EntryRewriteProgress({ attempts }: { attempts: EntryRewrite[] }) {
  const t = useTranslations();
  return (
    <div className="flex flex-col gap-3 rounded-md bg-muted/50 p-4">
      <p className="text-sm font-semibold text-muted-foreground">{t("rewrite.progressTitle")}</p>
      <MoodProgress
        attempts={attempts.map((attempt) => ({
          attemptNumber: attempt.attemptNumber,
          mood: (attempt.moodAfter ?? null) as Mood | null,
        }))}
      />
      <ol className="flex flex-col gap-2">
        {attempts.map((attempt) => (
          <li key={attempt.id} className="flex flex-col gap-2 rounded-md bg-card px-4 py-3 shadow-card">
            <div className="flex flex-wrap items-center gap-2">
              {attempt.moodAfter != null && (
                <MoodOrb mood={attempt.moodAfter as Mood} className="size-7" />
              )}
              <span className="font-semibold text-foreground">
                {t("history.attemptLabel", { n: attempt.attemptNumber })}
              </span>
              {/* RN-ES-11: un intento con señal de cuidado no se compara ni se nombra; solo se dice que se guardó. */}
              {attempt.result === "RISK" && (
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-base font-semibold text-muted-foreground">
                  {t("history.resultSaved")}
                </span>
              )}
              {attempt.inJar && (
                <span className="flex items-center gap-1.5 text-base text-muted-foreground">
                  <Amphora className="size-4" aria-hidden />
                  {t("history.inJar")}
                </span>
              )}
            </div>
            <p className="font-hand text-base leading-relaxed whitespace-pre-line text-foreground md:text-lg">
              {attempt.text}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** CU-12: discreto, al final; confirma antes de borrar. */
function DeleteEntry({ journalEntryId }: { journalEntryId: number }) {
  const t = useTranslations();
  const router = useRouter();
  const deleteMutation = useDeleteEntry();
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function handleDelete() {
    try {
      await deleteMutation.mutateAsync(journalEntryId);
      toast.success(t("history.deleted"));
      router.push("/historial");
    } catch (error) {
      setConfirmOpen(false);
      toast.error(t(error instanceof BffError ? errorMessageKey(error.code) : "common.unexpectedError"));
    }
  }

  return (
    <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="self-start text-[#A83A2F] hover:bg-destructive/10 hover:text-[#A83A2F] dark:text-destructive dark:hover:text-destructive"
        >
          <Trash2 className="size-4" aria-hidden />
          {t("history.deleteCta")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("history.deleteConfirmTitle")}</DialogTitle>
          <DialogDescription>{t("history.deleteConfirmBody")}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="destructive" disabled={deleteMutation.isPending} onClick={handleDelete}>
            {deleteMutation.isPending ? t("history.deleting") : t("history.deleteConfirmButton")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
