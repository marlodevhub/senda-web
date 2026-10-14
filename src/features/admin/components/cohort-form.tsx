"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { FieldError } from "@/components/forms/field-error";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BffError } from "@/lib/api/client";
import { adminErrorMessageKey } from "@/features/admin/api/error-messages";
import { useCreateCohort } from "@/features/admin/api/use-cohorts";
import { createCohortFormSchema, type CreateCohortFormValues } from "@/features/admin/schemas/admin.schema";

/** CU-24 paso 1: crear una cohorte nueva. */
export function CohortForm() {
  const t = useTranslations();
  const createCohort = useCreateCohort();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateCohortFormValues>({ resolver: zodResolver(createCohortFormSchema) });

  async function onSubmit(values: CreateCohortFormValues) {
    try {
      await createCohort.mutateAsync(values);
      toast.success(t("admin.cohorts.created"));
      reset();
    } catch (error) {
      if (error instanceof BffError) {
        toast.error(t(adminErrorMessageKey(error.code)));
        return;
      }
      toast.error(t("common.unexpectedError"));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-wrap items-end gap-3" noValidate>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">{t("admin.cohorts.nameLabel")}</Label>
        <Input id="name" aria-invalid={Boolean(errors.name)} {...register("name")} />
        <FieldError message={errors.name?.message} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="startDate">{t("admin.cohorts.startDateLabel")}</Label>
        <Input id="startDate" type="date" aria-invalid={Boolean(errors.startDate)} {...register("startDate")} />
        <FieldError message={errors.startDate?.message} />
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? t("admin.cohorts.creating") : t("admin.cohorts.createSubmit")}
      </Button>
    </form>
  );
}
