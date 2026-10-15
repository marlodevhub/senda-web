"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Mail } from "lucide-react";
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
 * desactivarlas borra el correo (RN-AC-16). Con las notificaciones activas se
 * muestra a qué correo llegan, enmascarado por el servidor ("es***@correo.pe"):
 * el correo completo nunca llega al navegador. Se puede cambiar sin desactivar.
 */
export function NotificationsForm({ enabled, maskedEmail }: { enabled: boolean; maskedEmail: string | null }) {
  const t = useTranslations();
  const update = useUpdateNotifications();
  const [editing, setEditing] = useState(false);

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
      setEditing(false);
      toast.success(t("profile.saved"));
    } catch (error) {
      toast.error(t(error instanceof BffError ? errorMessageKey(error.code) : "common.unexpectedError"));
    }
  }

  if (enabled && !editing) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-base text-foreground">{t("profile.notificationsOn")}</p>
        {maskedEmail && (
          <p className="flex items-center gap-3 rounded-md bg-muted px-4 py-3 text-base">
            <Mail className="size-5 shrink-0 text-muted-foreground" aria-hidden />
            <span className="flex min-w-0 flex-col">
              <span className="text-muted-foreground">{t("profile.notificationsSentTo")}</span>
              <span className="truncate font-semibold text-foreground">{maskedEmail}</span>
            </span>
          </p>
        )}
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button type="button" variant="outline" className="sm:flex-1" onClick={() => setEditing(true)}>
            {t("profile.changeEmail")}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="sm:flex-1"
            disabled={update.isPending}
            onClick={() => save({ enabled: false })}
          >
            {update.isPending ? t("profile.saving") : t("profile.disableNotifications")}
          </Button>
        </div>
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
      <p className="text-base text-muted-foreground">
        {editing ? t("profile.changeEmailHint") : t("profile.notificationsOffDescription")}
      </p>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">{t("profile.emailLabel")}</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          maxLength={254}
          autoFocus={editing}
          aria-invalid={Boolean(errors.email)}
          {...register("email")}
        />
        <FieldError message={errors.email?.message} />
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="submit" variant="outline" className="sm:flex-1" disabled={isSubmitting}>
          {isSubmitting ? t("profile.saving") : editing ? t("profile.saveEmail") : t("profile.enableNotifications")}
        </Button>
        {editing && (
          <Button
            type="button"
            variant="ghost"
            className="sm:flex-1"
            onClick={() => {
              reset({ enabled: true, email: "" });
              setEditing(false);
            }}
          >
            {t("common.cancel")}
          </Button>
        )}
      </div>
    </form>
  );
}
