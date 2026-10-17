"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FieldError } from "@/components/forms/field-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BffError } from "@/lib/api/client";
import { errorMessageKey } from "@/lib/api/error-messages";
import { queryKeys } from "@/lib/api/query-keys";
import { useSetUpPassword } from "@/features/profile/api/use-profile";
import { setUpPasswordFormSchema, type SetUpPasswordFormValues } from "@/features/profile/schemas/profile.schema";

/**
 * CU-20: quien activó con Google crea aquí su primera contraseña, para entrar también con su usuario. Necesita el
 * usuario antes. Al crearla recibe su código de recuperación, una sola vez (RN-AC-05).
 */
export function SetUpPasswordForm({ hasUsername }: { hasUsername: boolean }) {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const setUp = useSetUpPassword();
  const [recoveryCode, setRecoveryCode] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SetUpPasswordFormValues>({ resolver: zodResolver(setUpPasswordFormSchema) });

  async function onSubmit(values: SetUpPasswordFormValues) {
    try {
      const result = await setUp.mutateAsync({ newPassword: values.newPassword });
      setRecoveryCode(result.recoveryCode);
    } catch (error) {
      if (error instanceof BffError && error.code === "WEAK_PASSWORD") {
        setError("newPassword", { message: errorMessageKey(error.code) });
        return;
      }
      toast.error(t(error instanceof BffError ? errorMessageKey(error.code) : "common.unexpectedError"));
    }
  }

  function onSaved() {
    toast.success(t("profile.passwordSetupDone"));
    // Ahora sí: el perfil ya tiene contraseña y esta tarjeta pasa a "Cambiar contraseña".
    void queryClient.invalidateQueries({ queryKey: queryKeys.profile() });
  }

  if (recoveryCode) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-base font-semibold text-foreground">{t("access.recoveryCodeTitle")}</p>
        <p className="text-base text-muted-foreground">{t("access.recoveryCodeBody")}</p>
        <p
          data-testid="recovery-code"
          className="rounded-lg bg-muted px-4 py-3 text-center font-mono text-xl font-bold tracking-widest text-foreground"
        >
          {recoveryCode}
        </p>
        <Button type="button" variant="outline" onClick={onSaved}>
          {t("access.recoveryCodeSaved")}
        </Button>
      </div>
    );
  }

  if (!hasUsername) {
    return <p className="text-base text-muted-foreground">{t("profile.passwordSetupNeedsUsername")}</p>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <p className="text-base text-muted-foreground">{t("profile.passwordSetupDescription")}</p>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="setUpPassword">{t("access.passwordLabel")}</Label>
        <Input
          id="setUpPassword"
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.newPassword)}
          aria-describedby="setUpPasswordHint"
          {...register("newPassword")}
        />
        <p id="setUpPasswordHint" className="text-base text-muted-foreground">
          {t("access.passwordHint")}
        </p>
        <FieldError message={errors.newPassword?.message} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="setUpPasswordConfirm">{t("access.passwordConfirmLabel")}</Label>
        <Input
          id="setUpPasswordConfirm"
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.newPasswordConfirm)}
          {...register("newPasswordConfirm")}
        />
        <FieldError message={errors.newPasswordConfirm?.message} />
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? t("profile.saving") : t("profile.passwordSetupSubmit")}
      </Button>
    </form>
  );
}
