"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { RotateCcw, Send } from "lucide-react";
import { FieldError } from "@/components/forms/field-error";
import { Button } from "@/components/ui/button";
import { EmotionCharacter, EmotionDefs } from "@/components/illustrations/emotion-characters";
import type { Mood } from "@/components/icons/mood-orb";
import { ContextPicker } from "@/features/journal/components/context-picker";
import { DraftStatusIcon } from "@/features/journal/components/draft-status";
import { JournalModeToggle } from "@/features/journal/components/journal-mode-toggle";
import { JournalPrompt, JournalTextarea } from "@/features/journal/components/journal-prompt";
import { MoodPicker } from "@/features/journal/components/mood-picker";
import { createJournalEntry } from "@/features/journal/api/create-entry";
import { clearDraft, saveDraft } from "@/features/journal/draft";
import { journalFormSchema, type JournalFormValues } from "@/features/journal/schemas/journal.schema";
import { useJournalDraft } from "@/features/journal/use-journal-draft";
import { countWords } from "@/features/journal/word-count";
import { BffError } from "@/lib/api/client";
import { errorMessageKey } from "@/lib/api/error-messages";
import { saveFieldTexts } from "@/lib/field-texts-cache";

/** Un solo aviso aunque el efecto se repita (modo estricto de React en desarrollo). */
const DRAFT_RECOVERED_TOAST_ID = "journal-draft-recovered";

/** El campo junto al que se muestra cada error de validación del servidor (CU-01); el resto va en un toast. */
function fieldForError(code: string, mode: JournalFormValues["mode"]): keyof JournalFormValues | null {
  switch (code) {
    case "MISSING_CONTEXT":
      return "context";
    case "MISSING_SECOND_QUESTION":
      return "q2";
    case "ENTRY_TOO_SHORT":
    case "TEXT_TOO_LONG":
      return mode === "GUIDED" ? "q1" : "freeText";
    default:
      return null;
  }
}

/** CU-01 Escribir registro: ánimo, modo, la hoja del diario y el contexto. */
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

  const draftStatus = useJournalDraft({
    control,
    getValues,
    reset,
    onRecovered: () =>
      toast(t("journal.draftRecovered"), {
        id: DRAFT_RECOVERED_TOAST_ID,
        icon: <RotateCcw className="size-4" aria-hidden />,
      }),
  });

  const mode = useWatch({ control, name: "mode" });
  const texts = useWatch({ control, name: ["q1", "q2", "q3", "freeText"] });
  const words = countWords(mode === "GUIDED" ? texts.slice(0, 3).join(" ") : (texts[3] ?? ""));

  async function onSubmit(values: JournalFormValues) {
    try {
      const created = await createJournalEntry(values, idempotencyKey);
      saveFieldTexts(
        created.journalEntryId,
        values.mode === "GUIDED"
          ? { Q1: values.q1 ?? "", Q2: values.q2 ?? "", Q3: values.q3 ?? "" }
          : { FREE_TEXT: values.freeText ?? "" },
      );
      clearDraft();
      router.push(`/espejo/${created.journalEntryId}`);
    } catch (error) {
      if (error instanceof BffError) {
        const field = fieldForError(error.code, values.mode);
        if (field) {
          setError(field, { message: errorMessageKey(error.code) });
        } else {
          toast.error(t(errorMessageKey(error.code)));
        }
        return;
      }
      // CU-01 5b: sin conexión, el texto no se pierde (queda en el borrador).
      saveDraft(getValues());
      toast.error(t(navigator.onLine ? "common.unexpectedError" : "journal.offline"));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      <EmotionDefs />
      <Controller
        control={control}
        name="mode"
        render={({ field }) => <JournalModeToggle value={field.value} onChange={field.onChange} />}
      />

      <section aria-labelledby="journal-mood" className="flex flex-col gap-2">
        <h2 id="journal-mood" className="text-center text-base font-semibold text-foreground">
          {t("journal.moodLabel")}
        </h2>
        <Controller
          control={control}
          name="moodBefore"
          render={({ field }) => (
            <MoodPicker
              label={t("journal.moodLabel")}
              value={field.value as Mood | undefined}
              onChange={field.onChange}
              className="bg-card/80 backdrop-blur"
            />
          )}
        />
        {errors.moodBefore && <FieldError message="journal.missingMood" />}
      </section>

      {/* La hoja del diario: sin cajas con borde, letra de cuaderno y aire para escribir. */}
      <div className="relative flex min-h-80 flex-col gap-2 rounded-[2rem] bg-card p-5 shadow-card md:p-8">
        <DraftStatusIcon status={draftStatus} className="absolute top-4 right-4 md:top-6 md:right-6" />
        {mode === "GUIDED" ? (
          <>
            <JournalPrompt id="q1" label={t("journal.q1Label")} error={errors.q1?.message}>
              <JournalTextarea id="q1" rows={2} placeholder={t("journal.q1Placeholder")} {...register("q1")} />
            </JournalPrompt>
            <JournalPrompt id="q2" label={t("journal.q2Label")} error={errors.q2?.message}>
              <JournalTextarea id="q2" rows={3} placeholder={t("journal.q2Placeholder")} {...register("q2")} />
            </JournalPrompt>
            <JournalPrompt id="q3" label={t("journal.q3Label")} error={errors.q3?.message}>
              <JournalTextarea id="q3" rows={2} placeholder={t("journal.q3Placeholder")} {...register("q3")} />
            </JournalPrompt>
          </>
        ) : (
          <JournalPrompt id="freeText" label={t("journal.freeTextLabel")} error={errors.freeText?.message}>
            <JournalTextarea
              id="freeText"
              rows={8}
              placeholder={t("journal.freeTextPlaceholder")}
              {...register("freeText")}
            />
          </JournalPrompt>
        )}

        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-4">
          <div className="flex flex-col gap-1">
            {/* Siempre en el mismo lugar: la hoja no cambia de tamaño al empezar a escribir. */}
            <div aria-hidden className="pointer-events-none flex -rotate-2 items-center gap-2">
              <p className="font-hand text-2xl whitespace-nowrap text-muted-foreground">{t("journal.handNote")}</p>
              <EmotionCharacter emotion="calm" className="w-9" />
            </div>
            <p className="text-base font-semibold text-foreground tabular-nums">
              {t("journal.wordCount", { count: words })}
            </p>
          </div>
          <Button
            type="submit"
            variant="hero"
            size="xl"
            disabled={isSubmitting}
            className="ms-auto shrink-0 rounded-full px-6"
          >
            <Send className="size-4" aria-hidden />
            {isSubmitting ? t("journal.submitting") : t("journal.submit")}
          </Button>
        </div>
      </div>

      {/* RN-DI-05: obligatorio; si falta, el error aparece aquí al enviar. */}
      <section aria-labelledby="journal-context" className="flex flex-col gap-2">
        <h2 id="journal-context" className="text-center text-base font-semibold text-foreground">
          {t("journal.contextLabel")}
        </h2>
        <Controller
          control={control}
          name="context"
          render={({ field }) => <ContextPicker value={field.value} onChange={field.onChange} />}
        />
        <FieldError message={errors.context?.message} />
      </section>
    </form>
  );
}
