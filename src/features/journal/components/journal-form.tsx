"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Check, RotateCcw } from "lucide-react";
import { FieldError } from "@/components/forms/field-error";
import { Button } from "@/components/ui/button";
import { EmotionCharacter, EmotionDefs } from "@/components/illustrations/emotion-characters";
import { moodSolidStyle, type Mood } from "@/components/icons/mood-orb";
import { ContextPicker } from "@/features/journal/components/context-picker";
import { DraftStatusIcon } from "@/features/journal/components/draft-status";
import { JournalModeToggle } from "@/features/journal/components/journal-mode-toggle";
import { JournalPrompt, JournalTextarea } from "@/components/forms/journal-sheet";
import { MoodPicker } from "@/components/forms/mood-picker";
import { createJournalEntry } from "@/features/journal/api/create-entry";
import { clearDraft, saveDraft } from "@/features/journal/draft";
import { journalFormSchema, type JournalFormValues } from "@/features/journal/schemas/journal.schema";
import { useJournalDraft } from "@/features/journal/use-journal-draft";
import { countWords } from "@/features/journal/word-count";
import { BffError } from "@/lib/api/client";
import { errorMessageKey } from "@/lib/api/error-messages";
import { saveFieldTexts } from "@/lib/field-texts-cache";
import { routes } from "@/lib/routes";

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

/**
 * CU-01 Escribir registro: ánimo, modo, la hoja del diario y el contexto.
 * `checkinMood`: la cara del check-in de hoy (CU-06), que llega ya marcada; se puede cambiar. Si el borrador trae otra,
 * manda el borrador (RS-DI-03).
 * `chosenMood`: la cara que acaba de elegir en Inicio al tocar Escribir (`/diario?animo=N`): esa manda sobre la del
 * borrador y la del check-in (el borrador conserva sus textos).
 */
export function JournalForm({ checkinMood, chosenMood }: { checkinMood?: Mood | null; chosenMood?: Mood | null }) {
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
    setValue,
    reset,
  } = useForm<JournalFormValues>({
    resolver: zodResolver(journalFormSchema),
    // RN-DI-02: el Diario abre en modo libre (un borrador recuperado manda su propio modo).
    defaultValues: { mode: "FREE" },
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

  // La cara recién elegida en Inicio se marca una sola vez, después de recuperar el borrador (va después de su efecto).
  const chosenApplied = useRef(false);
  useEffect(() => {
    if (chosenMood && !chosenApplied.current) {
      chosenApplied.current = true;
      setValue("moodBefore", chosenMood);
    }
  }, [chosenMood, setValue]);

  // El check-in llega después de montar (y del borrador): solo se marca si todavía no hay una cara elegida.
  useEffect(() => {
    if (checkinMood && getValues("moodBefore") === undefined) {
      setValue("moodBefore", checkinMood);
    }
  }, [checkinMood, getValues, setValue]);

  const mode = useWatch({ control, name: "mode" });
  const moodBefore = useWatch({ control, name: "moodBefore" });
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
      router.push(routes.mirror(created.journalEntryId));
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
              className="bg-card/90"
            />
          )}
        />
        {errors.moodBefore && <FieldError message="journal.missingMood" />}
      </section>

      {/* La hoja del diario: sin cajas con borde, letra de cuaderno y aire para escribir. */}
      <div className="relative flex min-h-80 flex-col gap-2 rounded-[2rem] bg-card p-5 shadow-card md:p-8">
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

        {/* La nota a mano en su propia línea y, debajo, el contador y Guardar en una misma fila (alineados al centro):
            así no se desacomodan en pantallas angostas. */}
        <div className="mt-auto flex flex-col gap-2 pt-4">
          {/* Siempre en el mismo lugar: la hoja no cambia de tamaño al empezar a escribir. */}
          <div aria-hidden className="pointer-events-none flex -rotate-2 items-center gap-2">
            <p className="font-hand text-base whitespace-nowrap text-muted-foreground">{t("journal.handNote")}</p>
            <EmotionCharacter emotion="calm" className="w-9" />
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <p className="text-base font-semibold whitespace-nowrap text-foreground tabular-nums">
                {t("journal.wordCount", { count: words })}
              </p>
              {draftStatus !== "empty" && (
                <>
                  <span aria-hidden className="h-5 w-px bg-border" />
                  <DraftStatusIcon status={draftStatus} />
                </>
              )}
            </div>
            {/* En el color de la cara elegida; sin cara todavía, el del tema. */}
            <Button
              type="submit"
              variant={moodBefore ? "default" : "hero"}
              size="xl"
              disabled={isSubmitting}
              className="shrink-0 rounded-full px-6"
              style={moodBefore ? moodSolidStyle(moodBefore as Mood) : undefined}
            >
              <Check className="size-4" aria-hidden />
              {isSubmitting ? t("journal.submitting") : t("journal.submit")}
            </Button>
          </div>
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
