"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MoodPicker } from "@/features/journal/components/mood-picker";
import type { Mood } from "@/components/icons/mood-face";
import { useRewriteGuide } from "@/features/rewrite/api/use-rewrite-guide";
import { useSubmitRewrite } from "@/features/rewrite/api/use-submit-rewrite";
import { useRewriteFeedback } from "@/features/rewrite/api/use-rewrite-feedback";
import { rewriteFormSchema, type RewriteFormValues } from "@/features/rewrite/schemas/rewrite.schema";
import { RewriteResult } from "@/features/rewrite/components/rewrite-result";
import { CareMessage } from "@/components/feedback/care-message";
import type { SubmitRewriteResult } from "@/features/rewrite/api/submit-rewrite";
import { BffError } from "@/lib/api/client";
import { errorMessageKey } from "@/lib/api/error-messages";

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
  const [exampleIndex, setExampleIndex] = useState(0);
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
          setError("text", { message: t(errorMessageKey(error.code)) });
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
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      <p className="rounded-sm bg-card p-3 text-sm font-semibold text-foreground shadow-card before:content-['“'] after:content-['”']">
        {guide.originalPhrase}
      </p>

      <div className="flex flex-col gap-3">
        <Label>{t("rewrite.guideQuestionsLabel")}</Label>
        {guide.questions.map((question, index) => (
          <div key={question} className="flex flex-col gap-1.5">
            <Label htmlFor={`guideAnswer${index + 1}`} className="text-sm font-normal text-muted-foreground">
              {question}
            </Label>
            <Textarea
              id={`guideAnswer${index + 1}`}
              rows={2}
              {...register(`guideAnswer${index + 1}` as "guideAnswer1" | "guideAnswer2" | "guideAnswer3")}
            />
          </div>
        ))}
      </div>

      {guide.examples.length > 0 && (
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="self-start"
            onClick={() => setExampleIndex((i) => (i + 1) % guide.examples.length)}
          >
            {t("rewrite.seeExample")}
          </Button>
          <p className="text-sm text-muted-foreground before:content-['“'] after:content-['”']">
            {guide.examples[exampleIndex]}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="text">{t("rewrite.textLabel")}</Label>
        <Textarea id="text" rows={4} autoComplete="off" {...register("text")} />
        {errors.text && <p className="text-sm text-destructive">{errors.text.message}</p>}
      </div>

      <Button type="submit" variant="hero" size="xl" disabled={isSubmitting}>
        {isSubmitting ? t("rewrite.submitting") : t("rewrite.submit")}
      </Button>
      <Button type="button" variant="outline" onClick={() => router.push(`/espejo/${journalEntryId}`)}>
        {t("common.back")}
      </Button>
    </form>
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
    (created.result === "ALMOST" || created.result === "STILL_HARD") &&
    created.attemptNumber < created.maxAttempts;

  return (
    <div className="flex flex-col gap-5">
      {created.result === "PENDING" ? (
        <p className="text-sm text-muted-foreground">{t("rewrite.pending")}</p>
      ) : (
        <RewriteResult outcome={created.result} before={originalPhrase} after={text} />
      )}

      {canRetry && (
        <Button variant="outline" onClick={onRetry}>
          {t("rewrite.tryAgain")}
        </Button>
      )}

      {!canRetry &&
        created.attemptNumber >= created.maxAttempts &&
        (created.result === "ALMOST" || created.result === "STILL_HARD") && (
          <p className="text-sm text-muted-foreground">{t("rewrite.thanks")}</p>
        )}

      <div className="flex flex-col gap-2">
        <Label>{t("rewrite.moodAfterLabel")}</Label>
        <MoodPicker
          value={mood}
          onChange={(value) => {
            setMood(value);
            feedbackMutation.mutate({ moodAfter: value });
          }}
          size="compact"
        />
      </div>

      <Button
        variant="gradient-outline"
        disabled={savedInJar}
        onClick={() => {
          setSavedInJar(true);
          feedbackMutation.mutate({ inJar: true });
        }}
      >
        {t("rewrite.saveInJar")}
      </Button>

      <Button variant="outline" onClick={() => router.push("/inicio")}>
        {t("rewrite.goHome")}
      </Button>
    </div>
  );
}
