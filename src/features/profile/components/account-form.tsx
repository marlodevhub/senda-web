"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { z } from "zod";
import { usernameSchema } from "@/lib/validation/username";
import { UsernameAvailabilityIcon, UsernameAvailabilityMessage } from "@/components/forms/username-availability";
import { useUsernameAvailability } from "@/hooks/use-username-availability";
import { AtSign, Check } from "lucide-react";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { FieldError } from "@/components/forms/field-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isGoogleSignInEnabled } from "@/config/public-env";
import { useChangeUsername, useLinkGoogle, useUnlinkGoogle } from "@/features/profile/api/use-profile";
import { BffError } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { errorMessageKey } from "@/lib/api/error-messages";

const usernameFormSchema = z.object({ username: usernameSchema });
type UsernameFormValues = z.infer<typeof usernameFormSchema>;

function errorKey(error: unknown): string {
  return error instanceof BffError ? errorMessageKey(error.code) : "common.unexpectedError";
}

/**
 * CU-20 "Tu cuenta": el usuario con el que entra (el código de participante solo sirvió para activar) y, si el ingreso
 * con Google está configurado, vincular o desvincular su cuenta de Google. Nada de esto lo ve el administrador.
 */
export function AccountForm({
  username,
  googleLinked,
  hasPassword,
}: {
  username: string | null;
  googleLinked: boolean;
  hasPassword: boolean;
}) {
  return (
    <div className="flex flex-col gap-5">
      <UsernameSection username={username} />
      {isGoogleSignInEnabled && <GoogleSection linked={googleLinked} canUnlink={hasPassword} />}
    </div>
  );
}

function UsernameSection({ username }: { username: string | null }) {
  const t = useTranslations();
  const change = useChangeUsername();
  const [editing, setEditing] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<UsernameFormValues>({
    resolver: zodResolver(usernameFormSchema),
    defaultValues: { username: username ?? "" },
  });
  // CU-20: al dejar de escribir, si el usuario nuevo está libre u ocupado (el actual no se consulta).
  const availability = useUsernameAvailability(useWatch({ control, name: "username" }) ?? "", username);

  async function save(values: UsernameFormValues) {
    try {
      await change.mutateAsync(values.username);
      toast.success(t("profile.saved"));
      reset({ username: values.username });
      setEditing(false);
    } catch (error) {
      if (error instanceof BffError && (error.code === "USERNAME_TAKEN" || error.code === "INVALID_USERNAME")) {
        setError("username", { message: errorMessageKey(error.code) });
        return;
      }
      toast.error(t(errorKey(error)));
    }
  }

  if (!editing) {
    return (
      <div className="flex flex-col gap-3">
        {username ? (
          <p className="flex items-center gap-3 rounded-md bg-muted px-4 py-3 text-base">
            <AtSign className="size-5 shrink-0 text-muted-foreground" aria-hidden />
            <span className="flex min-w-0 flex-col">
              <span className="text-muted-foreground">{t("profile.usernameCurrent")}</span>
              <span className="truncate font-semibold text-foreground">{username}</span>
            </span>
          </p>
        ) : (
          <p className="text-base text-muted-foreground">{t("profile.usernameNone")}</p>
        )}
        <Button type="button" variant="outline" className="self-start rounded-full" onClick={() => setEditing(true)}>
          {t(username ? "profile.usernameChange" : "profile.usernameCreate")}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(save)} noValidate className="flex flex-col gap-2">
      <Label htmlFor="profile-username" className="text-base">
        {t("access.usernameLabel")}
      </Label>
      <div className="relative">
        <Input
          id="profile-username"
          className={cn(
            "pr-12",
            availability === "available" && "border-sprout focus-visible:border-sprout focus-visible:ring-sprout/40",
          )}
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          maxLength={30}
          aria-invalid={Boolean(errors.username) || availability === "taken"}
          aria-describedby="profile-username-hint profile-username-availability"
          {...register("username")}
        />
        <UsernameAvailabilityIcon state={availability} />
      </div>
      {errors.username ? (
        <FieldError message={errors.username.message} />
      ) : availability === "available" || availability === "taken" ? (
        <UsernameAvailabilityMessage id="profile-username-availability" state={availability} />
      ) : (
        <>
          <p id="profile-username-hint" className="text-base text-muted-foreground">
            {t("access.usernameHint")}
          </p>
          <UsernameAvailabilityMessage id="profile-username-availability" state={availability} />
        </>
      )}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" variant="outline" className="rounded-full" disabled={isSubmitting}>
          <Check className="size-4" aria-hidden />
          {isSubmitting ? t("profile.saving") : t("profile.usernameSave")}
        </Button>
        <Button type="button" variant="ghost" className="rounded-full" onClick={() => setEditing(false)}>
          {t("common.cancel")}
        </Button>
      </div>
    </form>
  );
}

/** Sin contraseña, Google es su única forma de entrar: no se ofrece desvincularlo hasta crearla. */
function GoogleSection({ linked, canUnlink }: { linked: boolean; canUnlink: boolean }) {
  const t = useTranslations();
  const link = useLinkGoogle();
  const unlink = useUnlinkGoogle();

  async function onCredential(idToken: string) {
    try {
      await link.mutateAsync(idToken);
      toast.success(t("profile.googleLinked"));
    } catch (error) {
      toast.error(t(errorKey(error)));
    }
  }

  async function onUnlink() {
    try {
      await unlink.mutateAsync(undefined);
      toast.success(t("profile.googleUnlinked"));
    } catch (error) {
      toast.error(t(errorKey(error)));
    }
  }

  return (
    <section aria-labelledby="profile-google" className="flex flex-col gap-3 border-t border-border pt-4">
      <h3 id="profile-google" className="text-base font-semibold text-foreground">
        {t("profile.googleTitle")}
      </h3>
      <p className="text-base text-muted-foreground">
        {t(linked ? "profile.googleLinkedText" : "profile.googleUnlinkedText")}
      </p>
      {linked && !canUnlink ? (
        <p className="text-base text-muted-foreground">{t("profile.googleOnlyHint")}</p>
      ) : linked ? (
        <Button
          type="button"
          variant="ghost"
          className="self-start rounded-full"
          disabled={unlink.isPending}
          onClick={onUnlink}
        >
          {t("profile.googleUnlink")}
        </Button>
      ) : (
        <div className="max-w-sm">
          <GoogleSignInButton text="continue_with" onCredential={onCredential} />
        </div>
      )}
    </section>
  );
}
