"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { FieldError } from "@/components/forms/field-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BffError } from "@/lib/api/client";
import { adminErrorMessageKey } from "@/features/admin/api/error-messages";
import {
  confirmAdminEnrollment,
  startAdminEnrollment,
  type AdminEnrollment,
} from "@/features/admin/api/invitations";
import {
  adminEnrollmentFormSchema,
  adminVerifyFormSchema,
  type AdminEnrollmentFormValues,
  type AdminVerifyFormValues,
} from "@/features/admin/schemas/admin.schema";

type Step = { name: "account" } | { name: "link"; code: string; enrollment: AdminEnrollment } | { name: "done" };

/**
 * CU-28: crear la cuenta de administrador con un código de invitación. 1) código, correo y contraseña; 2) vincular la
 * app autenticadora (QR o clave) y confirmar con un código de 6 dígitos; 3) listo, se entra por el ingreso normal.
 */
export function AdminEnrollmentFlow() {
  const t = useTranslations();
  const [step, setStep] = useState<Step>({ name: "account" });

  function showError(error: unknown) {
    toast.error(t(error instanceof BffError ? adminErrorMessageKey(error.code) : "common.unexpectedError"));
  }

  if (step.name === "done") {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <CheckCircle2 className="size-10 text-primary" aria-hidden />
        <h2 className="font-heading text-lg font-semibold text-foreground">{t("admin.invite.doneTitle")}</h2>
        <p className="text-sm text-muted-foreground">{t("admin.invite.doneBody")}</p>
        <Button asChild className="w-full">
          <Link href="/admin/login">{t("admin.invite.goToLogin")}</Link>
        </Button>
      </div>
    );
  }

  if (step.name === "link") {
    return (
      <LinkAuthenticator
        enrollment={step.enrollment}
        onBack={() => setStep({ name: "account" })}
        onConfirm={async (totpCode) => {
          try {
            await confirmAdminEnrollment({ code: step.code, totpCode });
            setStep({ name: "done" });
          } catch (error) {
            showError(error);
          }
        }}
      />
    );
  }

  return (
    <AccountForm
      onSubmit={async (values) => {
        try {
          const enrollment = await startAdminEnrollment({
            code: values.code,
            email: values.email,
            password: values.password,
          });
          setStep({ name: "link", code: values.code, enrollment });
        } catch (error) {
          showError(error);
        }
      }}
    />
  );
}

function AccountForm({ onSubmit }: { onSubmit: (values: AdminEnrollmentFormValues) => Promise<void> }) {
  const t = useTranslations();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminEnrollmentFormValues>({ resolver: zodResolver(adminEnrollmentFormSchema) });

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1 text-center">
        <h2 className="font-heading text-lg font-semibold text-foreground">{t("admin.invite.title")}</h2>
        <p className="text-sm text-muted-foreground">{t("admin.invite.subtitle")}</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="invite-code">{t("admin.invite.codeLabel")}</Label>
          <Input
            id="invite-code"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            className="font-mono tracking-wider uppercase"
            aria-invalid={Boolean(errors.code)}
            {...register("code")}
          />
          <FieldError message={errors.code?.message} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="invite-email">{t("admin.emailLabel")}</Label>
          <Input
            id="invite-email"
            type="email"
            autoComplete="username"
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />
          <FieldError message={errors.email?.message} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="invite-password">{t("admin.passwordLabel")}</Label>
          <Input
            id="invite-password"
            type="password"
            autoComplete="new-password"
            aria-describedby="invite-password-hint"
            aria-invalid={Boolean(errors.password)}
            {...register("password")}
          />
          <p id="invite-password-hint" className="text-sm text-muted-foreground">
            {t("admin.invite.passwordHint")}
          </p>
          <FieldError message={errors.password?.message} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="invite-confirm-password">{t("admin.invite.confirmPasswordLabel")}</Label>
          <Input
            id="invite-confirm-password"
            type="password"
            autoComplete="new-password"
            aria-invalid={Boolean(errors.confirmPassword)}
            {...register("confirmPassword")}
          />
          <FieldError message={errors.confirmPassword?.message} />
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t("admin.invite.starting") : t("admin.invite.startSubmit")}
        </Button>
        <Button asChild variant="ghost">
          <Link href="/admin/login">{t("admin.invite.backToLogin")}</Link>
        </Button>
      </form>
    </div>
  );
}

function LinkAuthenticator({
  enrollment,
  onBack,
  onConfirm,
}: {
  enrollment: AdminEnrollment;
  onBack: () => void;
  onConfirm: (totpCode: string) => Promise<void>;
}) {
  const t = useTranslations();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminVerifyFormValues>({ resolver: zodResolver(adminVerifyFormSchema) });

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1 text-center">
        <h2 className="font-heading text-lg font-semibold text-foreground">{t("admin.invite.linkTitle")}</h2>
        <p className="text-sm text-muted-foreground">{t("admin.invite.linkSubtitle")}</p>
      </div>
      {/* QR en PNG generado por senda-api (sin servicios externos); siempre sobre blanco para que se pueda escanear. */}
      {/* eslint-disable-next-line @next/next/no-img-element -- imagen en data: URI, no hay nada que optimizar */}
      <img
        src={`data:image/png;base64,${enrollment.qrPngBase64}`}
        alt={t("admin.invite.qrAlt")}
        width={200}
        height={200}
        className="mx-auto rounded-md bg-white p-1"
      />
      <div className="flex flex-col gap-1.5">
        <p className="text-sm text-muted-foreground">{t("admin.invite.secretLabel")}</p>
        <code
          data-testid="totp-secret"
          className="rounded-md bg-muted px-3 py-2 text-center font-mono text-sm tracking-wider break-all text-foreground select-all"
        >
          {enrollment.secret.match(/.{1,4}/g)?.join(" ")}
        </code>
        <a href={enrollment.otpAuthUri} className="text-center text-sm font-medium text-bloom-ink underline">
          {t("admin.invite.openInApp")}
        </a>
      </div>
      <form onSubmit={handleSubmit((values) => onConfirm(values.code))} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="invite-totp">{t("admin.totpLabel")}</Label>
          <Input
            id="invite-totp"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            aria-invalid={Boolean(errors.code)}
            {...register("code")}
          />
          <FieldError message={errors.code?.message} />
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t("admin.invite.confirming") : t("admin.invite.confirmSubmit")}
        </Button>
        <Button type="button" variant="ghost" onClick={onBack}>
          {t("admin.invite.back")}
        </Button>
      </form>
    </div>
  );
}
