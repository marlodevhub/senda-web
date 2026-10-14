"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { FieldError } from "@/components/forms/field-error";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BffError } from "@/lib/api/client";
import { errorMessageKey } from "@/lib/api/error-messages";
import { logout } from "@/features/access/api/logout";
import { useWithdraw } from "@/features/profile/api/use-withdraw";
import {
  withdrawFormSchema,
  type WithdrawFormValues,
  type WithdrawalOption,
} from "@/features/profile/schemas/profile.schema";

const OPTIONS: { value: WithdrawalOption; titleKey: string; descriptionKey: string }[] = [
  { value: "KEEP_DATA", titleKey: "profile.keepDataTitle", descriptionKey: "profile.keepDataDescription" },
  { value: "DELETE_ALL", titleKey: "profile.deleteAllTitle", descriptionKey: "profile.deleteAllDescription" },
];

/** CU-21 Retirarse del estudio: explica las 2 opciones sin pedir motivo (RN-AC-15). */
export function WithdrawalForm() {
  const t = useTranslations();
  const router = useRouter();
  const withdrawMutation = useWithdraw();
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<WithdrawFormValues>({
    resolver: zodResolver(withdrawFormSchema),
    defaultValues: { option: "KEEP_DATA" },
  });
  const selectedOption = useWatch({ control, name: "option" });

  async function onSubmit(values: WithdrawFormValues) {
    try {
      await withdrawMutation.mutateAsync(values);
      setDone(true);
      await logout();
    } catch (error) {
      if (error instanceof BffError) {
        if (error.code === "INCORRECT_PASSWORD") {
          setError("password", { message: errorMessageKey(error.code) });
          return;
        }
        toast.error(t(errorMessageKey(error.code)));
        return;
      }
      toast.error(t("common.unexpectedError"));
    }
  }

  if (done) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <p className="font-display text-lg leading-snug text-foreground">{t("profile.withdrawalDone")}</p>
        <Button variant="outline" onClick={() => router.push("/login")}>
          {t("common.goToLogin")}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      <p className="text-sm text-muted-foreground">{t("profile.withdrawalExplanation")}</p>

      <div role="radiogroup" aria-label={t("profile.withdrawalOptionsLabel")} className="flex flex-col gap-2">
        {OPTIONS.map((option) => {
          const active = selectedOption === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setValue("option", option.value)}
              className={cn(
                "flex flex-col gap-1 rounded-md border p-3 text-left transition-colors",
                active ? "border-bloom bg-bloom-tint" : "border-border bg-card",
              )}
            >
              <span className="text-sm font-bold text-foreground">{t(option.titleKey)}</span>
              <span className="text-xs text-muted-foreground">{t(option.descriptionKey)}</span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">{t("profile.confirmPasswordLabel")}</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={Boolean(errors.password)}
          {...register("password")}
        />
        <FieldError message={errors.password?.message} />
      </div>

      <Button type="submit" variant="destructive" disabled={isSubmitting}>
        {isSubmitting ? t("profile.withdrawing") : t("profile.withdrawSubmit")}
      </Button>
    </form>
  );
}
