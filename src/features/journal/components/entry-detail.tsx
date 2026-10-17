"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Amphora, Feather, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MoodOrb, type Mood } from "@/components/icons/mood-orb";
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
import type {
  EntryAnalysisField,
  EntryMirrorFinding,
  EntryRewrite,
  JournalEntryDetail,
} from "@/features/journal/api/get-entry-detail";
import { CONTEXT_ICONS } from "@/features/journal/context-icons";
import { patternLabelKey } from "@/lib/pattern-labels";
import { routes } from "@/lib/routes";
import { BffError } from "@/lib/api/client";
import { errorMessageKey } from "@/lib/api/error-messages";
import { cn } from "@/lib/utils";
import { JOURNAL_CONTEXT_LABEL_KEY } from "@/types/journal-context";
import type { Dimension } from "@/types/dimension";

const RESULT_STYLE: Record<string, { key: string; tone: string }> = {
  SOFTENED: { key: "history.resultSoftened", tone: "bg-sprout-tint text-sprout-ink" },
  ALMOST: { key: "history.resultAlmost", tone: "bg-root-tint text-root-ink" },
  STILL_HARD: { key: "history.resultStillHard", tone: "bg-flow-tint text-flow-ink" },
  PENDING: { key: "history.resultPending", tone: "bg-muted text-muted-foreground" },
  // RN-ES-11: si la reescritura tuvo una señal de cuidado no se compara ni se nombra; solo se dice que se guardó.
  RISK: { key: "history.resultSaved", tone: "bg-muted text-muted-foreground" },
};

/** Resaltado de cada frase dentro del texto, en el tono suave de su dimensión. */
const DIMENSION_MARK: Record<Dimension, string> = {
  D1: "bg-root-tint text-root-ink",
  D2: "bg-bloom-tint text-bloom-ink",
  D3: "bg-flow-tint text-flow-ink",
};

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

function fragmentOf(finding: EntryMirrorFinding, entry: JournalEntryDetail): string {
  return (entry[FIELD_TEXT[finding.field]] ?? "").slice(finding.start, finding.end);
}

/** El texto de una respuesta con sus frases detectadas resaltadas (en el orden en que aparecen). */
function Highlighted({ text, findings }: { text: string; findings: EntryMirrorFinding[] }) {
  const sorted = [...findings].sort((a, b) => a.start - b.start);
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  for (const finding of sorted) {
    if (finding.start < cursor) continue;
    parts.push(text.slice(cursor, finding.start));
    parts.push(
      <mark
        key={finding.findingId}
        className={cn("rounded-md px-1 py-0.5 box-decoration-clone", DIMENSION_MARK[finding.dimension])}
      >
        {text.slice(finding.start, finding.end)}
      </mark>,
    );
    cursor = finding.end;
  }
  parts.push(text.slice(cursor));
  return <>{parts}</>;
}

/**
 * CU-11 Consultar detalle (RN-HI-03/04), CU-12 Eliminar registro (RN-HI-05/06). Con el mismo lenguaje del Diario:
 * arriba el día, la cara y el contexto; la hoja con la letra manuscrita y las frases duras resaltadas en el tono de
 * su dimensión; al lado (escritorio) lo que notó el Espejo, cada frase con su acceso a Reescribir, y las
 * reescrituras. Eliminar queda discreto, al final.
 */
export function EntryDetail({ journalEntryId }: { journalEntryId: number }) {
  const t = useTranslations();
  const { data: entry, isPending } = useEntryDetail(journalEntryId);

  if (isPending || !entry) {
    return <p className="text-center text-base text-muted-foreground">{t("common.loading")}</p>;
  }

  const isRisk = entry.status === "RISK";
  const findings = entry.status === "COMPLETED" && !isRisk ? (entry.mirror?.findings ?? []) : [];
  const canRewrite = !isRisk && entry.status === "COMPLETED" && entry.rewrites.length < 2;
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
            {t("history.dayLabel", { day: entry.interventionDay })}
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
      </header>

      <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-start lg:gap-6">
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
                <Highlighted text={entry[FIELD_TEXT[field]] ?? ""} findings={findingsIn(field)} />
              </p>
            </section>
          ))}
        </article>

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
                  {findings.map((finding) => (
                    <li key={finding.findingId}>
                      <FindingRow
                        fragment={fragmentOf(finding, entry)}
                        label={t(patternLabelKey(finding.pattern))}
                        dimension={finding.dimension}
                        href={canRewrite ? routes.rewrite(entry.id, finding.findingId) : undefined}
                        linkLabel={t("home.pendingRewriteThis", { fragment: fragmentOf(finding, entry) })}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {!isRisk && entry.rewrites.length > 0 && (
            <section
              aria-labelledby="entry-rewrites"
              className="flex flex-col gap-3 rounded-lg bg-card p-5 shadow-card"
            >
              <h2 id="entry-rewrites" className="font-heading text-lg font-bold text-foreground">
                {t("history.rewritesTitle")}
              </h2>
              <ul className="flex flex-col gap-3">
                {groupByFinding(entry.rewrites).map((versions) => (
                  <li key={versions[0].findingId}>
                    <RewriteGroup versions={versions} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          <DeleteEntry journalEntryId={entry.id} />
        </div>
      </div>
    </div>
  );
}

/** Las versiones de cada frase, en orden de intento; las frases en el orden en que se reescribieron por primera vez. */
function groupByFinding(rewrites: EntryRewrite[]): EntryRewrite[][] {
  const groups = new Map<number, EntryRewrite[]>();
  for (const rewrite of [...rewrites].sort((a, b) => a.id - b.id)) {
    groups.set(rewrite.findingId, [...(groups.get(rewrite.findingId) ?? []), rewrite]);
  }
  return [...groups.values()].map((versions) => versions.sort((a, b) => a.attemptNumber - b.attemptNumber));
}

/** Una frase reescrita: la original tachada y debajo cada versión, con su texto, resultado, ánimo y frasco. */
function RewriteGroup({ versions }: { versions: EntryRewrite[] }) {
  const t = useTranslations();
  return (
    <div className="flex flex-col gap-2 rounded-md bg-muted/50 p-4">
      <p className="font-hand text-base text-muted-foreground line-through decoration-muted-foreground/50 before:content-['“'] after:content-['”'] md:text-lg">
        {versions[0].originalPhrase}
      </p>
      <ol className="flex flex-col gap-2">
        {versions.map((rewrite) => {
          const result = RESULT_STYLE[rewrite.result ?? "PENDING"] ?? RESULT_STYLE.PENDING;
          return (
            <li key={rewrite.id} className="flex flex-col gap-2 rounded-md bg-card px-4 py-3 shadow-card">
              <div className="flex flex-wrap items-center gap-2">
                <Feather className="size-4 text-muted-foreground" aria-hidden />
                <span className="font-semibold text-foreground">
                  {t("history.attemptLabel", { n: rewrite.attemptNumber })}
                </span>
                <span className={cn("rounded-full px-2.5 py-0.5 text-base font-semibold", result.tone)}>
                  {t(result.key)}
                </span>
              </div>
              <p className="font-hand text-base leading-relaxed text-foreground before:content-['“'] after:content-['”'] md:text-lg">
                {rewrite.text}
              </p>
              {(rewrite.moodAfter != null || rewrite.inJar) && (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-base text-muted-foreground">
                  {rewrite.moodAfter != null && (
                    <span className="flex items-center gap-1.5">
                      {t("history.moodAfterLabel")}
                      <MoodOrb mood={rewrite.moodAfter as Mood} className="size-7" />
                    </span>
                  )}
                  {rewrite.inJar && (
                    <span className="flex items-center gap-1.5">
                      <Amphora className="size-4" aria-hidden />
                      {t("history.inJar")}
                    </span>
                  )}
                </div>
              )}
            </li>
          );
        })}
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
