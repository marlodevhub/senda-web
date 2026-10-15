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
import { errorMessageKey } from "@/lib/api/error-messages";
import { useUpdateNotifications } from "@/features/profile/api/use-profile";
import { notificationsFormSchema, type NotificationsFormValues } from "@/features/profile/schemas/profile.schema";

/**
 * CU-20 2c: activar las notificaciones pide un correo válido (RS-AC-14);
 * desactivarlas borra el correo (RN-AC-16). El correo guardado nunca se
 * vuelve a mostrar: solo se sabe si las notificaciones están activas.
 */
export function NotificationsForm({ enabled }: { enabled: boolean }) {
  const t = useTranslations();
  const update = useUpdateNotifications();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<NotificationsFormValues>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues: { enabled: true, email: "" },
  });

  async function save(values: { enabled: boolean; email?: string }) {
    try {
      await update.mutateAsync(values);
      reset({ enabled: true, email: "" });
      toast.success(t("profile.saved"));
    } catch (error) {
      toast.error(t(error instanceof BffError ? errorMessageKey(error.code) : "common.unexpectedError"));
    }
  }

  if (enabled) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-base text-foreground">{t("profile.notificationsOn")}</p>
        <Button type="button" variant="outline" disabled={update.isPending} onClick={() => save({ enabled: false })}>
          {update.isPending ? t("profile.saving") : t("profile.disableNotifications")}
        </Button>
      </div>
    );
  }

  async function onSubmit(values: NotificationsFormValues) {
    if (!values.email) {
      setError("email", { message: "profile.emailRequired" });
      return;
    }
    await save({ enabled: true, email: values.email });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <p className="text-base text-muted-foreground">{t("profile.notificationsOffDescription")}</p>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">{t("profile.emailLabel")}</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          maxLength={254}
          aria-invalid={Boolean(errors.email)}
          {...register("email")}
        />
        <FieldError message={errors.email?.message} />
      </div>
      <Button type="submit" variant="outline" disabled={isSubmitting}>
        {isSubmitting ? t("profile.saving") : t("profile.enableNotifications")}
      </Button>
    </form>
  );
}
