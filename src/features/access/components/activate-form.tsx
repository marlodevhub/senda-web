"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { BffError } from "@/lib/api/client";
import { errorMessageKey } from "@/lib/api/error-messages";
import { activateFormSchema, type ActivateFormValues } from "@/features/access/schemas/access.schema";
import { activateAccount } from "@/features/access/api/activate";

export function ActivateForm() {
  const t = useTranslations();
  const router = useRouter();
  const [recoveryCode, setRecoveryCode] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ActivateFormValues>({ resolver: zodResolver(activateFormSchema) });

  async function onSubmit(values: ActivateFormValues) {
    try {
      const result = await activateAccount({ code: values.code, password: values.password });
      setRecoveryCode(result.recoveryCode);
    } catch (error) {
      if (error instanceof BffError) {
        if (error.code === "INVALID_CODE" || error.code === "ACTIVATION_NOT_POSSIBLE") {
          setError("code", { message: t(errorMessageKey(error.code)) });
          return;
        }
        if (error.code === "WEAK_PASSWORD") {
          setError("password", { message: t(errorMessageKey(error.code)) });
          return;
        }
        toast.error(t(errorMessageKey(error.code)));
        return;
      }
      toast.error(t("common.unexpectedError"));
    }
  }

  if (recoveryCode) {
    return (
      <Card>
        <CardContent className="flex flex-col gap-4 pt-2">
          <h2 className="font-heading text-lg font-semibold text-foreground">
            {t("access.recoveryCodeTitle")}
          </h2>
          <p className="text-sm text-muted-foreground">{t("access.recoveryCodeBody")}</p>
          <p
            data-testid="recovery-code"
            className="rounded-lg bg-muted px-4 py-3 text-center font-mono text-xl font-bold tracking-widest text-foreground"
          >
            {recoveryCode}
          </p>
          <Button
            type="button"
            variant="hero"
            size="xl"
            onClick={() => router.push("/consentimiento")}
          >
            {t("access.recoveryCodeSaved")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="code">{t("access.codeLabel")}</Label>
        <Input
          id="code"
          autoComplete="off"
          placeholder={t("access.codePlaceholder")}
          aria-invalid={Boolean(errors.code)}
          {...register("code")}
        />
        {errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">{t("access.passwordLabel")}</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.password)}
          {...register("password")}
        />
        {errors.password ? (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        ) : (
          <p className="text-xs text-muted-foreground">{t("access.passwordHint")}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="passwordConfirm">{t("access.passwordConfirmLabel")}</Label>
        <Input
          id="passwordConfirm"
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.passwordConfirm)}
          {...register("passwordConfirm")}
        />
        {errors.passwordConfirm && (
          <p className="text-sm text-destructive">{errors.passwordConfirm.message}</p>
        )}
      </div>

      <Button type="submit" variant="hero" size="xl" disabled={isSubmitting} className="mt-2">
        {isSubmitting ? t("access.activating") : t("access.activateSubmit")}
      </Button>
    </form>
  );
}
