"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BffError } from "@/lib/api/client";
import { errorMessageKey } from "@/lib/api/error-messages";
import { useGenerateRecoveryCode } from "@/features/profile/api/use-profile";
import {
  generateRecoveryCodeFormSchema,
  type GenerateRecoveryCodeFormValues,
} from "@/features/profile/schemas/profile.schema";

/** CU-20 2b: pide la contraseña y muestra el código nuevo una sola vez (no se guarda en el cliente). */
export function RecoveryCodeForm() {
  const t = useTranslations();
  const generate = useGenerateRecoveryCode();
  const [recoveryCode, setRecoveryCode] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<GenerateRecoveryCodeFormValues>({ resolver: zodResolver(generateRecoveryCodeFormSchema) });

  async function onSubmit(values: GenerateRecoveryCodeFormValues) {
    try {
      const result = await generate.mutateAsync(values);
      reset();
      setRecoveryCode(result.recoveryCode);
    } catch (error) {
      if (error instanceof BffError && error.code === "INCORRECT_PASSWORD") {
        setError("password", { message: t("profile.currentPasswordError") });
        return;
      }
      toast.error(t(error instanceof BffError ? errorMessageKey(error.code) : "common.unexpectedError"));
    }
  }

  if (recoveryCode) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">{t("access.recoveryCodeBody")}</p>
        <p
          data-testid="recovery-code"
          className="rounded-lg bg-muted px-4 py-3 text-center font-mono text-xl font-bold tracking-widest text-foreground"
        >
          {recoveryCode}
        </p>
        <Button type="button" variant="outline" onClick={() => setRecoveryCode(null)}>
          {t("access.recoveryCodeSaved")}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <p className="text-sm text-muted-foreground">{t("profile.recoveryDescription")}</p>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="recoveryPassword">{t("profile.confirmPasswordLabel")}</Label>
        <Input
          id="recoveryPassword"
          type="password"
          autoComplete="current-password"
          aria-invalid={Boolean(errors.password)}
          {...register("password")}
        />
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>
      <Button type="submit" variant="outline" disabled={isSubmitting}>
        {isSubmitting ? t("profile.saving") : t("profile.recoverySubmit")}
      </Button>
    </form>
  );
}
