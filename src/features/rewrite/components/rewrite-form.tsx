"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Amphora, Check, ChevronDown, Feather, Home, Lightbulb, Loader2, RotateCcw } from "lucide-react";
import { JournalPrompt, JournalTextarea } from "@/components/forms/journal-sheet";
import { Button } from "@/components/ui/button";
import { CareMessage } from "@/components/feedback/care-message";
import { HighlightedText } from "@/components/feedback/highlighted-text";
import { MoodProgress } from "@/components/feedback/mood-progress";
import { MoodOrb } from "@/components/icons/mood-orb";
import { useRewriteGuide } from "@/features/rewrite/api/use-rewrite-guide";
import { useSubmitRewrite } from "@/features/rewrite/api/use-submit-rewrite";
import { useSaveInJar } from "@/features/rewrite/api/use-rewrite-feedback";
import type { Guide } from "@/features/rewrite/api/get-guide";
import type { SubmitRewriteResult } from "@/features/rewrite/api/submit-rewrite";
import { rewriteFormSchema, type RewriteFormValues } from "@/features/rewrite/schemas/rewrite.schema";
import { BffError } from "@/lib/api/client";
import { errorMessageKey } from "@/lib/api/error-messages";
import { DIMENSION_CARD, DIMENSION_DOT, DIMENSION_TINT } from "@/lib/dimension-style";
import { patternLabelKey } from "@/lib/pattern-labels";
import { routes } from "@/lib/routes";
import { BackLink } from "@/components/layout/back-link";
import { cn } from "@/lib/utils";
import type { Dimension } from "@/types/dimension";

/** El registro tal como lo escribió (en guiado, sus 3 respuestas) con sus frases duras, para reescribirlo completo. */
export type EntryContext = {
  paragraphs: {
    label: string;
    text: string;
    ranges: { key: number; start: number; end: number; dimension: Dimension; badge: number }[];
  }[];
  /** El texto con el que empieza la reescritura (las respuestas, una por párrafo). */
  originalText: string;
};

/** Qué dice cada resultado (RN-RE-05): nunca califica ni bloquea. */
const OUTCOME_KEY = {
  SOFTENED: "rewrite.softened",
  ALMOST: "rewrite.almost",
  STILL_HARD: "rewrite.stillHard",
  PENDING: "rewrite.pending",
} as const;

/**
 * CU-04 Reescribir un registro: todas sus frases duras en una sola reescritura (no una por frase). La primera vez se
 * parte del texto del registro y se cambia lo que suena duro; si ya tiene reescrituras ("Reescribir nuevamente"), el
 * campo empieza en blanco. La IA le pone a cada intento una carita (1 a 5) y la fila de caritas muestra el progreso. Se
 * puede intentar las veces que haga falta; al llegar a verde se puede guardar en el frasco o reescribir nuevamente. La
 * carita no la marca el estudiante.
 */
export function RewriteForm({
  journalEntryId,
  entryContext,
}: {
  journalEntryId: number;
  /** El registro con sus frases; null mientras carga. */
  entryContext: EntryContext | null;
}) {
  const { data: guide, isPending } = useRewriteGuide(journalEntryId);

  if (isPending || !guide || !entryContext) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden />
      </div>
    );
  }

  // Se monta cuando ya están el registro y los intentos: el campo empieza con el registro o, si ya lo reescribió, en blanco.
  return <RewriteSheet journalEntryId={journalEntryId} guide={guide} entryContext={entryContext} />;
}

function RewriteSheet({
  journalEntryId,
  guide,
  entryContext,
}: {
  journalEntryId: number;
  guide: Guide;
  entryContext: EntryContext;
}) {
  const t = useTranslations();
  const router = useRouter();
  const submitMutation = useSubmitRewrite(journalEntryId);
  const saveInJar = useSaveInJar(journalEntryId);
  const [exampleIndex, setExampleIndex] = useState<number | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);
  const [lastResult, setLastResult] = useState<SubmitRewriteResult | null>(null);

  const lastAttempt = guide.attempts.at(-1);
  const rewritingAgain = guide.attempts.length > 0;
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RewriteFormValues>({
    resolver: zodResolver(rewriteFormSchema),
    defaultValues: { text: rewritingAgain ? "" : entryContext.originalText },
  });

  /** Después de llegar a verde: otra reescritura del mismo registro, desde cero. */
  function rewriteAgain() {
    setLastResult(null);
    setExampleIndex(null);
    reset({ text: "" });
  }

  if (lastResult?.result === "RISK") {
    return <CareMessage />;
  }

  async function onSubmit(values: RewriteFormValues) {
    try {
      setLastResult(await submitMutation.mutateAsync(values.text));
    } catch (error) {
      // Texto corto, igual al registro o tope de intentos: el aviso va junto al campo.
      if (error instanceof BffError) {
        setError("text", { message: errorMessageKey(error.code) });
        return;
      }
      throw error;
    }
  }

  const progress = guide.attempts.map((attempt) => ({ attemptNumber: attempt.attemptNumber, mood: attempt.mood }));
  // La tarjeta de "quedó reescrito" sale al llegar a verde aquí; al volver a entrar se ofrece reescribir nuevamente.
  const finalAttempt =
    lastResult?.completed && lastAttempt?.rewriteId === lastResult.rewriteId ? lastAttempt : undefined;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      {/* Se llega desde el Espejo, el registro, Inicio, Historial o un mensaje: vuelve a donde estaba. */}
      <BackLink href={routes.entry(journalEntryId)} preferHistory />
      <RewriteHeader />

      {/* El registro completo, con todas sus frases duras resaltadas en el tono de su dimensión. */}
      <section
        aria-labelledby="rewrite-entry"
        className={cn("flex flex-col gap-3 rounded-[1.75rem] px-5 py-4", DIMENSION_CARD[guide.dimension])}
      >
        <h2 id="rewrite-entry" className="text-sm font-bold tracking-wide text-muted-foreground uppercase">
          {t("rewrite.entryLabel")}
        </h2>
        {entryContext.paragraphs.map((paragraph) => (
          <div key={paragraph.label} className="flex flex-col gap-0.5">
            {entryContext.paragraphs.length > 1 && (
              <p className="font-hand text-base leading-snug font-medium text-(--prompt-red) md:text-lg">
                {paragraph.label}
              </p>
            )}
            <p className="font-hand text-lg leading-relaxed whitespace-pre-line text-foreground md:text-xl">
              <HighlightedText
                text={paragraph.text}
                ranges={paragraph.ranges.map((range) => ({
                  key: range.key,
                  start: range.start,
                  end: range.end,
                  badge: range.badge,
                  className: cn("font-semibold", DIMENSION_TINT[range.dimension]),
                }))}
              />
            </p>
          </div>
        ))}
        <ul className="flex flex-col gap-1.5">
          {guide.phrases.map((phrase, index) => (
            <li key={phrase.findingId} className="flex items-start gap-2 text-base leading-snug text-muted-foreground">
              <span aria-hidden className={cn("mt-[0.45rem] size-2 shrink-0 rounded-full", DIMENSION_DOT[phrase.dimension])} />
              <span>
                <span className="font-semibold tabular-nums">{index + 1}.</span> {t(patternLabelKey(phrase.pattern))}
              </span>
            </li>
          ))}
        </ul>
        <p className="text-sm text-muted-foreground">{t("rewrite.phrasesHint")}</p>
      </section>

      {/* El progreso: la carita que la IA le dio a cada intento. */}
      {progress.length > 0 && (
        <section aria-labelledby="rewrite-progress" className="flex flex-col gap-2 rounded-lg bg-card p-5 shadow-card">
          <h2 id="rewrite-progress" className="font-heading text-lg font-bold text-foreground">
            {t("rewrite.progressTitle")}
          </h2>
          <MoodProgress attempts={progress} />
          {!guide.completed && <p className="text-sm text-muted-foreground">{t("rewrite.progressHint")}</p>}
        </section>
      )}

      {/* Lo que dijo del último intento. */}
      {lastResult && (
        <p
          role="status"
          className={cn(
            "flex items-center gap-3 rounded-lg px-4 py-3 text-base font-semibold",
            lastResult.result === "SOFTENED" ? "bg-sprout-tint text-sprout-ink" : "bg-root-tint text-root-ink",
          )}
        >
          {lastResult.mood !== null && <MoodOrb mood={lastResult.mood} decorative className="size-9 shrink-0" />}
          {t(OUTCOME_KEY[lastResult.result])}
        </p>
      )}

      {finalAttempt ? (
        // Verde: el registro quedó reescrito.
        <section aria-labelledby="rewrite-done" className="flex flex-col gap-4 rounded-[2rem] bg-card p-5 shadow-card md:p-8">
          <h2 id="rewrite-done" className="flex items-center gap-3 font-heading text-xl font-bold text-foreground">
            {finalAttempt.mood !== null && <MoodOrb mood={finalAttempt.mood} decorative className="size-10" />}
            {t("rewrite.completedTitle")}
          </h2>
          <p className="rounded-md bg-sprout-tint px-4 py-3 font-hand text-lg whitespace-pre-line text-sprout-ink md:text-xl">
            {finalAttempt.text}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="gradient-outline"
              className="rounded-full sm:flex-1"
              disabled={finalAttempt.inJar || saveInJar.isPending}
              onClick={() => saveInJar.mutate(finalAttempt.rewriteId)}
            >
              <Amphora className="size-4" aria-hidden />
              {finalAttempt.inJar ? t("rewrite.savedInJar") : t("rewrite.saveInJar")}
            </Button>
            <Button variant="outline" className="rounded-full sm:flex-1" onClick={rewriteAgain}>
              <RotateCcw className="size-4" aria-hidden />
              {t("rewrite.rewriteAgain")}
            </Button>
            <Button variant="hero" className="rounded-full sm:flex-1" onClick={() => router.push("/inicio")}>
              <Home className="size-4" aria-hidden />
              {t("rewrite.goHome")}
            </Button>
          </div>
        </section>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col gap-3 rounded-[2rem] bg-card p-5 shadow-card md:p-8"
        >
          {/* Ayuda opcional y plegada: las preguntas para pensarlo, no se responden por escrito. */}
          <div className="rounded-2xl bg-foreground/[0.04]">
            <button
              type="button"
              aria-expanded={guideOpen}
              aria-controls="rewrite-guide"
              onClick={() => setGuideOpen((open) => !open)}
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left focus-visible:outline-2 focus-visible:outline-ring"
            >
              <Lightbulb className="size-5 shrink-0 text-(--prompt-red)" aria-hidden />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="font-semibold text-foreground">{t("rewrite.guideToggle")}</span>
                <span className="text-sm text-muted-foreground">{t("rewrite.guideToggleHint")}</span>
              </span>
              <ChevronDown
                className={cn("size-5 shrink-0 text-muted-foreground transition-transform", guideOpen && "rotate-180")}
                aria-hidden
              />
            </button>
            <ul id="rewrite-guide" hidden={!guideOpen} className="flex flex-col gap-2 px-4 pb-4">
              {guide.questions.map((question) => (
                <li key={question} className="font-hand text-base text-foreground md:text-lg">
                  {question}
                </li>
              ))}
            </ul>
          </div>

          <JournalPrompt id="text" label={t("rewrite.textLabel")} error={errors.text?.message}>
            <JournalTextarea id="text" rows={8} autoComplete="off" {...register("text")} />
          </JournalPrompt>
          <p className="text-sm text-muted-foreground">
            {t(rewritingAgain ? "rewrite.textHintAgain" : "rewrite.textHint")}
          </p>

          {guide.examples.length > 0 && (
            <div className="flex flex-col items-start gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-expanded={exampleIndex !== null}
                onClick={() => setExampleIndex((i) => (i === null ? 0 : (i + 1) % guide.examples.length))}
              >
                <Lightbulb className="size-4" aria-hidden />
                {t("rewrite.seeExample")}
              </Button>
              {/* Solo al pedirlo: el ejemplo inspira, no se copia (nunca prescriptivo). */}
              {exampleIndex !== null && (
                <p
                  aria-live="polite"
                  className="rounded-md bg-sprout-tint px-4 py-2.5 font-hand text-base text-sprout-ink before:content-['“'] after:content-['”'] md:text-lg"
                >
                  {guide.examples[exampleIndex]}
                </p>
              )}
            </div>
          )}

          <div className="mt-2 flex items-center justify-end">
            <Button type="submit" variant="hero" size="xl" disabled={isSubmitting} className="px-6">
              {lastResult ? <RotateCcw className="size-4" aria-hidden /> : <Check className="size-4" aria-hidden />}
              {isSubmitting ? t("rewrite.submitting") : lastResult ? t("rewrite.tryAgain") : t("rewrite.submit")}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

/** Título de la Reescritura ("Reescribir"), en una palabra, con el ícono de pluma. */
function RewriteHeader() {
  const t = useTranslations();
  return (
    <header className="flex items-center gap-3">
      <span
        aria-hidden
        className="flex size-11 shrink-0 items-center justify-center rounded-full bg-celeste text-bloom-ink"
      >
        <Feather className="size-5" />
      </span>
      <h1 className="font-heading text-2xl leading-tight font-bold text-foreground md:text-3xl">
        {t("rewrite.title")}
      </h1>
    </header>
  );
}
