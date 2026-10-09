"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BffError } from "@/lib/api/client";
import { adminErrorMessageKey } from "@/features/admin/api/error-messages";
import { adminVerify } from "@/features/admin/api/login";
import { adminVerifyFormSchema, type AdminVerifyFormValues } from "@/features/admin/schemas/admin.schema";

/** CU-23 paso 3-4: código de 6 dígitos de la app autenticadora. */
export function TotpForm() {
  const t = useTranslations();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminVerifyFormValues>({ resolver: zodResolver(adminVerifyFormSchema) });

  async function onSubmit(values: AdminVerifyFormValues) {
    try {
      await adminVerify(values.code);
      router.push("/admin/cohortes");
    } catch (error) {
      if (error instanceof BffError) {
        if (error.code === "CHALLENGE_EXPIRED") {
          toast.error(t(adminErrorMessageKey(error.code)));
          router.push("/admin/login");
          return;
        }
        toast.error(t(adminErrorMessageKey(error.code)));
        return;
      }
      toast.error(t("common.unexpectedError"));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="code">{t("admin.totpLabel")}</Label>
        <Input
          id="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          aria-invalid={Boolean(errors.code)}
          {...register("code")}
        />
        {errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? t("admin.verifying") : t("admin.verifySubmit")}
      </Button>
    </form>
  );
}
