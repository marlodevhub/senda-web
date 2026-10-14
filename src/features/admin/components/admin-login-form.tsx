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
import { adminErrorMessageKey } from "@/features/admin/api/error-messages";
import { adminLogin } from "@/features/admin/api/login";
import { adminLoginFormSchema, type AdminLoginFormValues } from "@/features/admin/schemas/admin.schema";

/** CU-23 paso 1-2: correo y contraseña; si son correctos, pasa a la verificación TOTP. */
export function AdminLoginForm() {
  const t = useTranslations();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminLoginFormValues>({ resolver: zodResolver(adminLoginFormSchema) });

  async function onSubmit(values: AdminLoginFormValues) {
    try {
      await adminLogin(values);
      router.push("/admin/verificar");
    } catch (error) {
      if (error instanceof BffError) {
        toast.error(t(adminErrorMessageKey(error.code)));
        return;
      }
      toast.error(t("common.unexpectedError"));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">{t("admin.emailLabel")}</Label>
        <Input
          id="email"
          type="email"
          autoComplete="username"
          aria-invalid={Boolean(errors.email)}
          {...register("email")}
        />
        <FieldError message={errors.email?.message} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">{t("admin.passwordLabel")}</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={Boolean(errors.password)}
          {...register("password")}
        />
        <FieldError message={errors.password?.message} />
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? t("admin.loggingIn") : t("admin.loginSubmit")}
      </Button>
    </form>
  );
}
