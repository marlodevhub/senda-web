"use client";

import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BffError } from "@/lib/api/client";
import { errorMessageKey } from "@/lib/api/error-messages";
import { loginFormSchema, type LoginFormValues } from "@/features/access/schemas/access.schema";
import { login, type LoginDestination } from "@/features/access/api/login";

const DESTINATION_ROUTE: Record<LoginDestination, string> = {
  CONSENT: "/consentimiento",
  // CU-17 (Bienvenida) todavía no se construyó; por ahora ambos llegan a Inicio.
  WELCOME: "/inicio",
  HOME: "/inicio",
};

export function LoginForm() {
  const t = useTranslations();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginFormSchema) });

  async function onSubmit(values: LoginFormValues) {
    try {
      const result = await login(values);
      router.push(DESTINATION_ROUTE[result.destination]);
    } catch (error) {
      if (error instanceof BffError) {
        if (error.code === "INVALID_CREDENTIALS") {
          setError("password", { message: t(errorMessageKey(error.code)) });
          return;
        }
        toast.error(t(errorMessageKey(error.code)));
        return;
      }
      toast.error(t("common.unexpectedError"));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="code">{t("access.codeLabel")}</Label>
        <Input
          id="code"
          autoComplete="username"
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
          autoComplete="current-password"
          aria-invalid={Boolean(errors.password)}
          {...register("password")}
        />
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>

      <Button type="submit" variant="hero" size="xl" disabled={isSubmitting} className="mt-2">
        {isSubmitting ? t("access.loggingIn") : t("access.loginSubmit")}
      </Button>

      <Link href="/recuperar" className="text-center text-sm text-muted-foreground underline-offset-4 hover:underline">
        {t("access.forgotPassword")}
      </Link>
    </form>
  );
}
