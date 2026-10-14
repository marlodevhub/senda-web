"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { FieldError } from "@/components/forms/field-error";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MoodPicker } from "@/features/journal/components/mood-picker";
import type { Mood } from "@/components/icons/mood-face";
import { ContextPicker } from "@/features/journal/components/context-picker";
import { journalFormSchema, type JournalFormValues } from "@/features/journal/schemas/journal.schema";
import { createJournalEntry } from "@/features/journal/api/create-entry";
import { BffError } from "@/lib/api/client";
import { errorMessageKey } from "@/lib/api/error-messages";
import { saveFieldTexts } from "@/lib/field-texts-cache";

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
  } = useForm<JournalFormValues>({
    resolver: zodResolver(journalFormSchema),
    defaultValues: { mode: "GUIDED" },
  });

  const mode = useWatch({ control, name: "mode" });

  async function onSubmit(values: JournalFormValues) {
    try {
      const created = await createJournalEntry(values, idempotencyKey);
      const fieldTexts: Record<string, string> =
        values.mode === "GUIDED"
          ? { Q1: values.q1 ?? "", Q2: values.q2 ?? "", Q3: values.q3 ?? "" }
          : { FREE_TEXT: values.freeText ?? "" };
      saveFieldTexts(created.journalEntryId, fieldTexts);
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
      toast.error(t("common.unexpectedError"));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      <div className="flex flex-col gap-2">
        <Label>{t("journal.moodLabel")}</Label>
        <Controller
          control={control}
          name="moodBefore"
          render={({ field }) => (
            <MoodPicker value={field.value as Mood | undefined} onChange={(mood) => field.onChange(mood)} />
          )}
        />
        {errors.moodBefore && <FieldError message="journal.missingMood" />}
      </div>

      <Controller
        control={control}
        name="mode"
        render={({ field }) => (
          <div className="flex gap-1.5 rounded-full bg-muted p-1" role="radiogroup" aria-label={t("journal.title")}>
            {(["GUIDED", "FREE"] as const).map((option) => (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={field.value === option}
                onClick={() => field.onChange(option)}
                className={cn(
                  "flex-1 rounded-full py-2 text-sm font-semibold transition-colors",
                  field.value === option ? "bg-card text-foreground shadow-card" : "text-muted-foreground",
                )}
              >
                {option === "GUIDED" ? t("journal.modeGuided") : t("journal.modeFree")}
              </button>
            ))}
          </div>
        )}
      />

      {mode === "GUIDED" ? (
        <>
          <Field id="q1" label={t("journal.q1Label")} error={errors.q1?.message}>
            <Textarea id="q1" rows={2} {...register("q1")} />
          </Field>
          <Field id="q2" label={t("journal.q2Label")} error={errors.q2?.message}>
            <Textarea id="q2" rows={3} {...register("q2")} />
          </Field>
          <Field id="q3" label={t("journal.q3Label")} error={errors.q3?.message}>
            <Textarea id="q3" rows={2} {...register("q3")} />
          </Field>
        </>
      ) : (
        <Field id="freeText" label={t("journal.freeTextLabel")} error={errors.freeText?.message}>
          <Textarea id="freeText" rows={6} {...register("freeText")} />
        </Field>
      )}

      <div className="flex flex-col gap-2">
        <Label>{t("journal.contextLabel")}</Label>
        <Controller
          control={control}
          name="context"
          render={({ field }) => <ContextPicker value={field.value} onChange={field.onChange} />}
        />
      </div>

      <Button type="submit" variant="hero" size="xl" disabled={isSubmitting} className="mt-2">
        {isSubmitting ? t("journal.submitting") : t("journal.submit")}
      </Button>
    </form>
  );
}

function Field({
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
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      <FieldError message={error} />
    </div>
  );
}
