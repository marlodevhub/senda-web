"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { FieldError } from "@/components/forms/field-error";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Feather, Send, Sparkles } from "lucide-react";
import { EmotionCharacter, EmotionDefs } from "@/components/illustrations/emotion-characters";
import { MoodPicker } from "@/features/journal/components/mood-picker";
import type { Mood } from "@/components/icons/mood-orb";
import { ContextPicker } from "@/features/journal/components/context-picker";
import { journalFormSchema, type JournalFormValues } from "@/features/journal/schemas/journal.schema";
import { createJournalEntry } from "@/features/journal/api/create-entry";
import { BffError } from "@/lib/api/client";
import { errorMessageKey } from "@/lib/api/error-messages";
import { saveFieldTexts } from "@/lib/field-texts-cache";
import { DRAFT_INTERVAL_MS, clearDraft, hasText, loadDraft, saveDraft } from "@/features/journal/draft";

export function JournalForm() {
  const t = useTranslations();
  const router = useRouter();
  // RS-TR-08: la misma clave en reintentos evita duplicar el registro si el envío se repite.
  const idempotencyKey = useMemo(() => crypto.randomUUID(), []);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    getValues,
    reset,
  } = useForm<JournalFormValues>({
    resolver: zodResolver(journalFormSchema),
    defaultValues: { mode: "GUIDED" },
  });
  const [draftRecovered, setDraftRecovered] = useState(false);

  // RS-DI-03: recupera el borrador al abrir y lo guarda cada 10 s.
  useEffect(() => {
    const draft = loadDraft();
    if (draft && hasText(draft)) {
      reset({ mode: "GUIDED", ...draft });
      // El borrador solo existe en el navegador: leerlo después de montar evita un desajuste de hidratación.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDraftRecovered(true);
    }
    const interval = window.setInterval(() => saveDraft(getValues()), DRAFT_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [getValues, reset]);

  const mode = useWatch({ control, name: "mode" });

  async function onSubmit(values: JournalFormValues) {
    try {
      const created = await createJournalEntry(values, idempotencyKey);
      const fieldTexts: Record<string, string> =
        values.mode === "GUIDED"
          ? { Q1: values.q1 ?? "", Q2: values.q2 ?? "", Q3: values.q3 ?? "" }
          : { FREE_TEXT: values.freeText ?? "" };
      saveFieldTexts(created.journalEntryId, fieldTexts);
      clearDraft();
      router.push(`/espejo/${created.journalEntryId}`);
    } catch (error) {
      if (error instanceof BffError) {
        if (error.code === "MISSING_SECOND_QUESTION") {
          setError("q2", { message: errorMessageKey(error.code) });
          return;
        }
        if (error.code === "ENTRY_TOO_SHORT" || error.code === "TEXT_TOO_LONG") {
          setError(mode === "GUIDED" ? "q1" : "freeText", { message: errorMessageKey(error.code) });
          return;
        }
        toast.error(t(errorMessageKey(error.code)));
        return;
      }
      // CU-01 5b: sin conexión, el texto no se pierde (queda en el borrador).
      saveDraft(getValues());
      toast.error(t(navigator.onLine ? "common.unexpectedError" : "journal.offline"));
    }
  }

  const texts = useWatch({ control, name: ["q1", "q2", "q3", "freeText"] });
  const written = mode === "GUIDED" ? texts.slice(0, 3).join(" ") : (texts[3] ?? "");
  const words = countWords(written);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      <EmotionDefs />
      {draftRecovered && (
        <p role="status" className="rounded-full bg-sprout-tint px-4 py-2 text-center text-base text-sprout-ink">
          {t("journal.draftRecovered")}
        </p>
      )}

      <Controller
        control={control}
        name="mode"
        render={({ field }) => (
          <div
            role="radiogroup"
            aria-label={t("journal.title")}
            className="mx-auto flex w-full max-w-sm gap-1 rounded-full bg-card/80 p-1 shadow-card backdrop-blur"
          >
            {(["GUIDED", "FREE"] as const).map((option) => {
              const Icon = option === "GUIDED" ? Sparkles : Feather;
              const active = field.value === option;
              return (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => field.onChange(option)}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-2 rounded-full py-2.5 text-base font-semibold transition-all focus-visible:outline-2 focus-visible:outline-ring",
                    active
                      ? "bg-[linear-gradient(135deg,var(--flow-tint),var(--bloom-tint))] text-foreground shadow-card"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                  {option === "GUIDED" ? t("journal.modeGuided") : t("journal.modeFree")}
                </button>
              );
            })}
          </div>
        )}
      />

      <section aria-labelledby="journal-mood" className="flex flex-col gap-2">
        <h2 id="journal-mood" className="text-center font-journal text-lg text-foreground italic">
          {t("journal.moodLabel")}
        </h2>
        <Controller
          control={control}
          name="moodBefore"
          render={({ field }) => (
            <MoodPicker
              label={t("journal.moodLabel")}
              value={field.value as Mood | undefined}
              onChange={(mood) => field.onChange(mood)}
              className="bg-card/80 backdrop-blur"
            />
          )}
        />
        {errors.moodBefore && <FieldError message="journal.missingMood" />}
      </section>

      {/* La hoja del diario: sin cajas con borde, letra de cuaderno y aire para escribir. */}
      <div className="relative flex min-h-80 flex-col gap-2 rounded-[2rem] bg-card/85 p-5 shadow-card backdrop-blur-xl md:p-8">
        {mode === "GUIDED" ? (
          <>
            <Prompt id="q1" label={t("journal.q1Label")} error={errors.q1?.message}>
              <JournalTextarea id="q1" rows={2} placeholder={t("journal.q1Placeholder")} {...register("q1")} />
            </Prompt>
            <Prompt id="q2" label={t("journal.q2Label")} error={errors.q2?.message}>
              <JournalTextarea id="q2" rows={3} placeholder={t("journal.q2Placeholder")} {...register("q2")} />
            </Prompt>
            <Prompt id="q3" label={t("journal.q3Label")} error={errors.q3?.message}>
              <JournalTextarea id="q3" rows={2} placeholder={t("journal.q3Placeholder")} {...register("q3")} />
            </Prompt>
          </>
        ) : (
          <Prompt id="freeText" label={t("journal.freeTextLabel")} error={errors.freeText?.message}>
            <JournalTextarea
              id="freeText"
              rows={8}
              placeholder={t("journal.freeTextPlaceholder")}
              {...register("freeText")}
            />
          </Prompt>
        )}

        {/* Compañía mientras la hoja está en blanco; se va al empezar a escribir. */}
        {words === 0 && (
          <div
            aria-hidden
            className="pointer-events-none flex flex-col items-center gap-1 self-center pt-2 motion-safe:animate-in motion-safe:fade-in-0"
          >
            <EmotionCharacter emotion="calm" className="w-16" />
            <p className="-rotate-3 font-hand text-2xl text-muted-foreground">{t("journal.handNote")}</p>
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <p className="text-base text-muted-foreground">
            <span className="font-semibold text-foreground tabular-nums">
              {t("journal.wordCount", { count: words })}
            </span>
            {words < MIN_WORDS && <span> · {t("journal.wordHint")}</span>}
          </p>
          <Button type="submit" variant="hero" size="xl" disabled={isSubmitting} className="shrink-0 rounded-full px-6">
            <Send className="size-4" aria-hidden />
            {isSubmitting ? t("journal.submitting") : t("journal.submit")}
          </Button>
        </div>
      </div>

      <section aria-labelledby="journal-context" className="flex flex-col gap-2">
        <h2 id="journal-context" className="text-center font-journal text-lg text-foreground italic">
          {t("journal.contextLabel")}
        </h2>
        <Controller
          control={control}
          name="context"
          render={({ field }) => <ContextPicker value={field.value} onChange={field.onChange} />}
        />
      </section>
    </form>
  );
}

/** RS-DI-02 se valida en el servidor; este conteo solo acompaña mientras se escribe. */
const MIN_WORDS = 15;

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Una pregunta del diario: la pregunta en cursiva y, debajo, el renglón para escribir. */
function Prompt({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    // El foco se ve en todo el bloque: el campo no tiene borde propio.
    <div className="-mx-3 flex flex-col gap-1 rounded-2xl px-3 py-2 transition-colors focus-within:bg-flow-tint/45">
      <label htmlFor={id} className="font-journal text-xl text-foreground italic">
        {label}
      </label>
      {children}
      <FieldError message={error} />
    </div>
  );
}

function JournalTextarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "field-sizing-content w-full resize-none bg-transparent font-journal text-lg leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/80",
        className,
      )}
      {...props}
    />
  );
}
