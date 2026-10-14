"use client";

import { useRouter } from "next/navigation";
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
import { logout } from "@/features/access/api/logout";
import { useChangePassword } from "@/features/profile/api/use-profile";
import {
  changePasswordFormSchema,
  type ChangePasswordFormValues,
} from "@/features/profile/schemas/profile.schema";

/**
 * CU-20 2a: pide la contraseña actual (RS-AC-13). El backend revoca la
 * renovación de sesión al cambiarla, así que se vuelve a iniciar sesión con
 * la contraseña nueva en vez de dejar que la sesión caduque sola a los 30 min.
 */
export function ChangePasswordForm() {
  const t = useTranslations();
  const router = useRouter();
  const changePassword = useChangePassword();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({ resolver: zodResolver(changePasswordFormSchema) });

  async function onSubmit(values: ChangePasswordFormValues) {
    try {
      await changePassword.mutateAsync({ currentPassword: values.currentPassword, newPassword: values.newPassword });
      toast.success(t("profile.passwordChanged"));
      await logout();
      router.push("/login");
    } catch (error) {
      if (error instanceof BffError && error.code === "INCORRECT_PASSWORD") {
        setError("currentPassword", { message: "profile.currentPasswordError" });
        return;
      }
      if (error instanceof BffError && error.code === "WEAK_PASSWORD") {
        setError("newPassword", { message: errorMessageKey(error.code) });
        return;
      }
      toast.error(t(error instanceof BffError ? errorMessageKey(error.code) : "common.unexpectedError"));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="currentPassword">{t("profile.currentPasswordLabel")}</Label>
        <Input
          id="currentPassword"
          type="password"
          autoComplete="current-password"
          aria-invalid={Boolean(errors.currentPassword)}
          {...register("currentPassword")}
        />
        <FieldError message={errors.currentPassword?.message} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="newPassword">{t("access.newPasswordLabel")}</Label>
        <Input
          id="newPassword"
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.newPassword)}
          aria-describedby="newPasswordHint"
          {...register("newPassword")}
        />
        <p id="newPasswordHint" className="text-xs text-muted-foreground">
          {t("access.passwordHint")}
        </p>
        <FieldError message={errors.newPassword?.message} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="newPasswordConfirm">{t("access.passwordConfirmLabel")}</Label>
        <Input
          id="newPasswordConfirm"
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.newPasswordConfirm)}
          {...register("newPasswordConfirm")}
        />
        <FieldError message={errors.newPasswordConfirm?.message} />
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? t("profile.saving") : t("profile.changePasswordSubmit")}
      </Button>
    </form>
  );
}
