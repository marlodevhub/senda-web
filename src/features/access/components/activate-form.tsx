"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { FieldError } from "@/components/forms/field-error";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AUTH_INPUT } from "@/features/access/components/auth-input";
import { Card, CardContent } from "@/components/ui/card";
import { BffError } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { errorMessageKey } from "@/lib/api/error-messages";
import { activateFormSchema, type ActivateFormValues } from "@/features/access/schemas/access.schema";
import { activateAccount, activateAccountWithGoogle } from "@/features/access/api/activate";
import { UsernameAvailabilityIcon, UsernameAvailabilityMessage } from "@/components/forms/username-availability";
import { useUsernameAvailability } from "@/hooks/use-username-availability";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { isGoogleSignInEnabled } from "@/config/public-env";

/**
 * CU-15 Activar cuenta. Camino principal: el código y la cuenta de Google (con ella entra desde ahora; el usuario y la
 * contraseña los crea después en el perfil si quiere). Para quien no usa Google, o si el entorno no lo tiene
 * configurado, el código con un usuario y una contraseña, que termina mostrando el código de recuperación.
 */
export function ActivateForm() {
  const t = useTranslations();
  const router = useRouter();
  const [recoveryCode, setRecoveryCode] = useState<string | null>(null);
  const [withPassword, setWithPassword] = useState(!isGoogleSignInEnabled);
  const [activatingWithGoogle, setActivatingWithGoogle] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    control,
    trigger,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ActivateFormValues>({ resolver: zodResolver(activateFormSchema) });
  // CU-15: al dejar de escribir, si el usuario está libre (check verde) u ocupado (X roja).
  const availability = useUsernameAvailability(useWatch({ control, name: "username" }) ?? "");

  /** Los errores del código van bajo su campo; los de Google y los demás, en un aviso. */
  function showActivationError(error: unknown): boolean {
    if (!(error instanceof BffError)) {
      toast.error(t("common.unexpectedError"));
      return true;
    }
    if (error.code === "INVALID_CODE" || error.code === "ACTIVATION_NOT_POSSIBLE") {
      setError("code", { message: errorMessageKey(error.code) });
      return true;
    }
    return false;
  }

  async function onGoogleCredential(idToken: string) {
    // Primero el código: Google solo confirma quién es, el código dice que fue invitado.
    if (!(await trigger("code"))) {
      return;
    }
    setActivatingWithGoogle(true);
    try {
      await activateAccountWithGoogle({ code: getValues("code").trim().toUpperCase(), idToken });
      router.push("/consentimiento");
    } catch (error) {
      setActivatingWithGoogle(false);
      if (!showActivationError(error) && error instanceof BffError) {
        toast.error(t(errorMessageKey(error.code)));
      }
    }
  }

  async function onSubmit(values: ActivateFormValues) {
    try {
      const result = await activateAccount({ code: values.code, username: values.username, password: values.password });
      setRecoveryCode(result.recoveryCode);
    } catch (error) {
      if (showActivationError(error)) {
        return;
      }
      if (error instanceof BffError) {
        if (error.code === "INVALID_USERNAME" || error.code === "USERNAME_TAKEN") {
          setError("username", { message: errorMessageKey(error.code) });
          return;
        }
        if (error.code === "WEAK_PASSWORD") {
          setError("password", { message: errorMessageKey(error.code) });
          return;
        }
        toast.error(t(errorMessageKey(error.code)));
      }
    }
  }

  // CU-15 para quien no usa Google: desde ahora entra con este usuario; el código solo se usa para activar.
  const passwordFields = (
    <>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="username">{t("access.usernameLabel")}</Label>
        <div className="relative">
          <Input
            className={cn(
              AUTH_INPUT,
              "pr-12",
              availability === "available" && "ring-2 ring-sprout focus-visible:ring-sprout",
            )}
            id="username"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            maxLength={30}
            placeholder={t("access.usernamePlaceholder")}
            aria-invalid={Boolean(errors.username) || availability === "taken"}
            aria-describedby="username-hint username-availability"
            {...register("username")}
          />
          <UsernameAvailabilityIcon state={availability} />
        </div>
        {errors.username ? (
          <FieldError message={errors.username.message} />
        ) : availability === "available" || availability === "taken" ? (
          <UsernameAvailabilityMessage id="username-availability" state={availability} />
        ) : (
          <>
            <p id="username-hint" className="text-base text-muted-foreground">
              {t("access.usernameHint")}
            </p>
            <UsernameAvailabilityMessage id="username-availability" state={availability} />
          </>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">{t("access.passwordLabel")}</Label>
        <Input
          className={AUTH_INPUT}
          id="password"
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.password)}
          {...register("password")}
        />
        {errors.password ? (
          <FieldError message={errors.password.message} />
        ) : (
          <p className="text-base text-muted-foreground">{t("access.passwordHint")}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="passwordConfirm">{t("access.passwordConfirmLabel")}</Label>
        <Input
          className={AUTH_INPUT}
          id="passwordConfirm"
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.passwordConfirm)}
          {...register("passwordConfirm")}
        />
        <FieldError message={errors.passwordConfirm?.message} />
      </div>

      <Button type="submit" variant="hero" size="xl" disabled={isSubmitting} className="mt-2 h-12 rounded-full">
        {isSubmitting ? t("access.activating") : t("access.activateSubmit")}
      </Button>
      {isGoogleSignInEnabled && (
        <>
          <OrDivider />
          <Button type="button" variant="ghost" className="rounded-full" onClick={() => setWithPassword(false)}>
            {t("access.activateWithGoogle")}
          </Button>
        </>
      )}
    </>
  );

  if (recoveryCode) {
    return (
      <Card>
        <CardContent className="flex flex-col gap-4 pt-2">
          <h2 className="font-heading text-lg font-semibold text-foreground">{t("access.recoveryCodeTitle")}</h2>
          <p className="text-base text-muted-foreground">{t("access.recoveryCodeBody")}</p>
          <p
            data-testid="recovery-code"
            className="rounded-lg bg-muted px-4 py-3 text-center font-mono text-xl font-bold tracking-widest text-foreground"
          >
            {recoveryCode}
          </p>
          <Button type="button" variant="hero" size="xl" onClick={() => router.push("/consentimiento")}>
            {t("access.recoveryCodeSaved")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <form
      // Con Google no hay nada que enviar con Enter: la activación la dispara el botón de Google.
      onSubmit={withPassword ? handleSubmit(onSubmit) : (event) => event.preventDefault()}
      className="flex flex-col gap-4"
      noValidate
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="code">{t("access.codeLabel")}</Label>
        <Input
          className={AUTH_INPUT}
          id="code"
          autoComplete="off"
          placeholder={t("access.codePlaceholder")}
          aria-invalid={Boolean(errors.code)}
          {...register("code")}
        />
        <FieldError message={errors.code?.message} />
      </div>

      {withPassword ? (
        passwordFields
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-base text-muted-foreground">{t("access.activateGoogleHint")}</p>
          {activatingWithGoogle ? (
            <p
              role="status"
              className="flex min-h-11 items-center justify-center gap-2 text-base text-muted-foreground"
            >
              <Loader2 className="size-5 animate-spin" aria-hidden />
              {t("access.activating")}
            </p>
          ) : (
            <GoogleSignInButton text="continue_with" onCredential={onGoogleCredential} />
          )}
          <OrDivider />
          <Button type="button" variant="ghost" className="rounded-full" onClick={() => setWithPassword(true)}>
            {t("access.activateWithPassword")}
          </Button>
        </div>
      )}
    </form>
  );
}

function OrDivider() {
  const t = useTranslations();
  return (
    <div aria-hidden className="flex items-center gap-3 text-base text-muted-foreground">
      <span className="h-px flex-1 bg-border" />
      {t("access.orDivider")}
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}
