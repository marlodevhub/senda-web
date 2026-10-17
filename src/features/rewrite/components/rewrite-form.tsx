"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Amphora, ArrowLeft, Check, Feather, Home, Lightbulb, Loader2 } from "lucide-react";
import { JournalPrompt, JournalTextarea } from "@/components/forms/journal-sheet";
import { Button } from "@/components/ui/button";
import { MoodPicker } from "@/features/journal/components/mood-picker";
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
import { patternLabelKey } from "@/lib/pattern-labels";
import { cn } from "@/lib/utils";
import type { Dimension } from "@/types/dimension";

const DIMENSION_DOT: Record<Dimension, string> = { D1: "bg-root", D2: "bg-bloom", D3: "bg-flow" };

/**
 * CU-04 completo salvo 2 recortes deliberados, iguales a los que ya
 * tiene el backend: elegir otro hallazgo del mismo registro (RN-RE-01
 * alt. 1a) y escribir una frase propia sin hallazgo (RN-RE-12) — ambos
 * quedan para un sprint posterior.
 */
export function RewriteForm({ journalEntryId, findingId }: { journalEntryId: number; findingId?: number }) {
  const t = useTranslations();
  const router = useRouter();
  const { data: guide, isPending: isGuidePending } = useRewriteGuide(journalEntryId, findingId);
  const submitMutation = useSubmitRewrite(journalEntryId);
  const [exampleIndex, setExampleIndex] = useState<number | null>(null);
  const [created, setCreated] = useState<SubmitRewriteResult | null>(null);

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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto flex w-full max-w-2xl flex-col gap-5" noValidate>
      <RewriteHeader />

      {/* La frase que se va a reescribir, en el tono suave del tema, con su tipo en lenguaje amable. */}
      <section aria-labelledby="rewrite-phrase" className="flex flex-col gap-1.5 rounded-lg bg-celeste px-5 py-4">
        <h2 id="rewrite-phrase" className="text-sm font-bold tracking-wide text-muted-foreground uppercase">
          {t("rewrite.yourPhrase")}
        </h2>
        <p className="font-display text-lg leading-snug font-semibold text-foreground before:content-['“'] after:content-['”']">
          {guide.originalPhrase}
        </p>
        <p className="flex items-start gap-2 text-base leading-snug text-muted-foreground">
          <span
            aria-hidden
            className={cn("mt-[0.45rem] size-2 shrink-0 rounded-full", DIMENSION_DOT[guide.dimension])}
          />
          {t(patternLabelKey(guide.pattern))}
        </p>
      </section>

      {/* La hoja, como en el Diario: las preguntas guía y la reescritura con letra manuscrita, sin cajas con borde. */}
      <div className="flex flex-col gap-2 rounded-[2rem] bg-card p-5 shadow-card md:p-8">
        <p className="text-base font-semibold text-muted-foreground">{t("rewrite.guideQuestionsLabel")}</p>
        {guide.questions.map((question, index) => {
          const id = `guideAnswer${index + 1}` as "guideAnswer1" | "guideAnswer2" | "guideAnswer3";
          return (
            <JournalPrompt key={question} id={id} label={question}>
              <JournalTextarea id={id} rows={2} {...register(id)} />
            </JournalPrompt>
          );
        })}

        {guide.examples.length > 0 && (
          <div className="flex flex-col items-start gap-2 py-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
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

        <div className="mt-2 border-t border-dashed border-border pt-3">
          <JournalPrompt id="text" label={t("rewrite.textLabel")} error={errors.text?.message}>
            <JournalTextarea id="text" rows={3} autoComplete="off" {...register("text")} />
          </JournalPrompt>
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            className="rounded-full"
            onClick={() => router.push(`/espejo/${journalEntryId}`)}
          >
            <ArrowLeft className="size-4" aria-hidden />
            {t("common.back")}
          </Button>
          <Button type="submit" variant="hero" size="xl" disabled={isSubmitting} className="ms-auto rounded-full px-6">
            <Check className="size-4" aria-hidden />
            {isSubmitting ? t("rewrite.submitting") : t("rewrite.submit")}
          </Button>
        </div>
      </div>
    </form>
  );
}

/** Título de la Reescritura con el ícono de pluma. */
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
      <h1 className="font-heading text-xl leading-tight font-bold text-foreground md:text-2xl">{t("rewrite.title")}</h1>
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
