"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Amphora, Check, ChevronDown, Feather, Home, Lightbulb, Loader2 } from "lucide-react";
import { JournalPrompt, JournalTextarea } from "@/components/forms/journal-sheet";
import { Button } from "@/components/ui/button";
import { MoodPicker } from "@/components/forms/mood-picker";
import type { Mood } from "@/components/icons/mood-orb";
import { useRewriteGuide } from "@/features/rewrite/api/use-rewrite-guide";
import { useSubmitRewrite } from "@/features/rewrite/api/use-submit-rewrite";
import { useRewriteFeedback } from "@/features/rewrite/api/use-rewrite-feedback";
import { rewriteFormSchema, type RewriteFormValues } from "@/features/rewrite/schemas/rewrite.schema";
import { RewriteResult } from "@/features/rewrite/components/rewrite-result";
import { CareMessage } from "@/components/feedback/care-message";
import type { SubmitRewriteResult } from "@/features/rewrite/api/submit-rewrite";
import { BffError } from "@/lib/api/client";
import { errorMessageKey } from "@/lib/api/error-messages";
import { DIMENSION_CARD, DIMENSION_DOT, DIMENSION_TINT } from "@/lib/dimension-style";
import { HighlightedText } from "@/components/feedback/highlighted-text";
import { patternLabelKey } from "@/lib/pattern-labels";
import { routes } from "@/lib/routes";
import { BackLink } from "@/components/layout/back-link";
import { cn } from "@/lib/utils";

/**
 * CU-04 completo salvo 2 recortes deliberados, iguales a los que ya
 * tiene el backend: elegir otro hallazgo del mismo registro (RN-RE-01
 * alt. 1a) y escribir una frase propia sin hallazgo (RN-RE-12) — ambos
 * quedan para un sprint posterior.
 */
/** La frase dentro del párrafo donde la escribió: la pregunta (o "Lo que escribiste"), su texto y dónde está la frase. */
export type PhraseContext = {
  label: string;
  text: string;
  start: number;
  end: number;
  /** Qué frase es dentro del registro (1, 2, …) y cuántas tiene. */
  number: number;
  total: number;
};

export function RewriteForm({
  journalEntryId,
  findingId,
  phraseContext,
}: {
  journalEntryId: number;
  findingId?: number;
  /** Para un hallazgo, su párrafo; si no se tiene (aún cargando), se muestra solo la frase. */
  phraseContext?: (findingId: number) => PhraseContext | null;
}) {
  const t = useTranslations();
  const { data: guide, isPending: isGuidePending } = useRewriteGuide(journalEntryId, findingId);
  const submitMutation = useSubmitRewrite(journalEntryId);
  const [exampleIndex, setExampleIndex] = useState<number | null>(null);
  const [created, setCreated] = useState<SubmitRewriteResult | null>(null);
  // Las preguntas guía son opcionales (RN-RE-02): plegadas, como ayuda para quien no sabe por dónde empezar.
  const [guideOpen, setGuideOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RewriteFormValues>({ resolver: zodResolver(rewriteFormSchema) });

  if (isGuidePending || !guide) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden />
      </div>
    );
  }

  async function onSubmit(values: RewriteFormValues) {
    if (!guide) return;
    try {
      const result = await submitMutation.mutateAsync({
        findingId: guide.findingId,
        text: values.text,
        guideAnswer1: values.guideAnswer1,
        guideAnswer2: values.guideAnswer2,
        guideAnswer3: values.guideAnswer3,
      });
      setCreated(result);
    } catch (error) {
      if (error instanceof BffError) {
        if (error.code === "REWRITE_TOO_SHORT" || error.code === "REWRITE_SAME_AS_ORIGINAL") {
          setError("text", { message: errorMessageKey(error.code) });
          return;
        }
      }
      throw error;
    }
  }

  if (created) {
    return (
      <RewriteOutcomeView
        originalPhrase={guide.originalPhrase}
        text={submitMutation.variables?.text ?? ""}
        created={created}
        onRetry={() => setCreated(null)}
      />
    );
  }

  const context = phraseContext?.(guide.findingId) ?? null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto flex w-full max-w-2xl flex-col gap-5" noValidate>
      {/* Se llega desde el Espejo, el registro, Inicio, Historial o un mensaje: vuelve a donde estaba. */}
      <BackLink href={routes.entry(journalEntryId)} preferHistory />
      <RewriteHeader />

      {/* La frase dentro del párrafo donde la escribió, resaltada, con su tipo en lenguaje amable. */}
      <section
        aria-labelledby="rewrite-phrase"
        className={cn("flex flex-col gap-2 rounded-[1.75rem] px-5 py-4", DIMENSION_CARD[guide.dimension])}
      >
        <h2 id="rewrite-phrase" className="text-sm font-bold tracking-wide text-muted-foreground uppercase">
          {context && context.total > 1
            ? t("rewrite.phraseOf", { number: context.number, total: context.total })
            : t("rewrite.yourPhrase")}
        </h2>
        {context ? (
          <>
            <p className="font-hand text-base leading-snug font-medium text-(--prompt-red) md:text-lg">
              {context.label}
            </p>
            <p className="font-hand text-lg leading-relaxed whitespace-pre-line text-foreground md:text-xl">
              <HighlightedText
                text={context.text}
                ranges={[
                  {
                    key: guide.findingId,
                    start: context.start,
                    end: context.end,
                    // Como un resaltador: el color saturado de su dimensión sobre el fondo suave.
                    className: cn("font-semibold", DIMENSION_TINT[guide.dimension]),
                  },
                ]}
              />
            </p>
          </>
        ) : (
          <p className="font-display text-lg leading-snug font-semibold text-foreground before:content-['“'] after:content-['”']">
            {guide.originalPhrase}
          </p>
        )}
        <p className="flex items-start gap-2 text-base leading-snug text-muted-foreground">
          <span
            aria-hidden
            className={cn("mt-[0.45rem] size-2 shrink-0 rounded-full", DIMENSION_DOT[guide.dimension])}
          />
          {t(patternLabelKey(guide.pattern))}
        </p>
      </section>

      {/* La hoja: primero la reescritura (lo único que se pide); la ayuda, opcional y plegada. */}
      <div className="flex flex-col gap-3 rounded-[2rem] bg-card p-5 shadow-card md:p-8">
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
          {/* Montadas aunque estén plegadas: lo que escribió no se pierde al cerrar. */}
          <div id="rewrite-guide" hidden={!guideOpen} className="px-4 pb-4">
            {guide.questions.map((question, index) => {
              const id = `guideAnswer${index + 1}` as "guideAnswer1" | "guideAnswer2" | "guideAnswer3";
              return (
                <JournalPrompt key={question} id={id} label={question}>
                  <JournalTextarea id={id} rows={2} {...register(id)} />
                </JournalPrompt>
              );
            })}
          </div>
        </div>

        <JournalPrompt id="text" label={t("rewrite.textLabel")} error={errors.text?.message}>
          <JournalTextarea id="text" rows={4} autoComplete="off" {...register("text")} />
        </JournalPrompt>

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

        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <Button type="submit" variant="hero" size="xl" disabled={isSubmitting} className="ms-auto px-6">
            <Check className="size-4" aria-hidden />
            {isSubmitting ? t("rewrite.submitting") : t("rewrite.submit")}
          </Button>
        </div>
      </div>
    </form>
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
      {/* El nombre de la pantalla en una palabra: dónde estoy. */}
      <h1 className="font-heading text-2xl leading-tight font-bold text-foreground md:text-3xl">
        {t("rewrite.title")}
      </h1>
    </header>
  );
}

function RewriteOutcomeView({
  originalPhrase,
  text,
  created,
  onRetry,
}: {
  originalPhrase: string;
  text: string;
  created: SubmitRewriteResult;
  onRetry: () => void;
}) {
  const t = useTranslations();
  const router = useRouter();
  const feedbackMutation = useRewriteFeedback(created.rewriteId);
  const [mood, setMood] = useState<Mood>();
  const [savedInJar, setSavedInJar] = useState(false);

  if (created.result === "RISK") {
    return <CareMessage />;
  }

  const canRetry =
    (created.result === "ALMOST" || created.result === "STILL_HARD") && created.attemptNumber < created.maxAttempts;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      <RewriteHeader />

      <section className="flex flex-col gap-3 rounded-[2rem] bg-card p-5 shadow-card md:p-8">
        {created.result === "PENDING" ? (
          <p className="text-base text-muted-foreground">{t("rewrite.pending")}</p>
        ) : (
          <RewriteResult outcome={created.result} before={originalPhrase} after={text} />
        )}

        {canRetry && (
          <Button variant="outline" className="self-start rounded-full" onClick={onRetry}>
            {t("rewrite.tryAgain")}
          </Button>
        )}

        {!canRetry &&
          created.attemptNumber >= created.maxAttempts &&
          (created.result === "ALMOST" || created.result === "STILL_HARD") && (
            <p className="text-base text-muted-foreground">{t("rewrite.thanks")}</p>
          )}
      </section>

      <section aria-labelledby="rewrite-mood-after" className="flex flex-col gap-2">
        <h2 id="rewrite-mood-after" className="text-center font-heading text-lg font-bold text-foreground">
          {t("rewrite.moodAfterLabel")}
        </h2>
        <MoodPicker
          label={t("rewrite.moodAfterLabel")}
          value={mood}
          onChange={(value) => {
            setMood(value);
            feedbackMutation.mutate({ moodAfter: value });
          }}
          className="bg-card/80 backdrop-blur"
        />
      </section>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          variant="gradient-outline"
          className="rounded-full sm:flex-1"
          disabled={savedInJar}
          onClick={() => {
            setSavedInJar(true);
            feedbackMutation.mutate({ inJar: true });
          }}
        >
          <Amphora className="size-4" aria-hidden />
          {t("rewrite.saveInJar")}
        </Button>
        <Button variant="hero" className="rounded-full sm:flex-1" onClick={() => router.push("/inicio")}>
          <Home className="size-4" aria-hidden />
          {t("rewrite.goHome")}
        </Button>
      </div>
    </div>
  );
}
