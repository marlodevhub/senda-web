"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LogoutButton } from "@/features/access/components/logout-button";
import { useProfile } from "@/features/profile/api/use-profile";
import { ChangePasswordForm } from "@/features/profile/components/change-password-form";
import { NotificationsForm } from "@/features/profile/components/notifications-form";
import { RecoveryCodeForm } from "@/features/profile/components/recovery-code-form";
import { ThemeSelector } from "@/features/profile/components/theme-selector";
import { StartingPointForm } from "@/features/welcome/components/starting-point-form";

/**
 * CU-20 Gestionar perfil (RN-AC-13): notificaciones por correo, contraseña,
 * código de recuperación, punto de partida (CU-17), ayuda e información
 * (volver a ver la bienvenida y leer el consentimiento), cerrar sesión y
 * retirarse (CU-21). Sin botón de "Necesito ayuda": Senda no es un servicio
 * de crisis (sección 15 del CLAUDE.md raíz).
 */
export function ProfilePageClient() {
  const t = useTranslations();
  const { data: profile, isPending, isError } = useProfile();

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-heading text-xl font-bold text-foreground">{t("profile.title")}</h1>

      <Section title={t("profile.notificationsTitle")}>
        {isPending ? (
          <Loader2 className="size-5 animate-spin text-muted-foreground" aria-label={t("common.loading")} />
        ) : isError || !profile ? (
          <p className="text-sm text-muted-foreground">{t("common.unexpectedError")}</p>
        ) : (
          <NotificationsForm enabled={profile.notificationsEnabled} />
        )}
      </Section>

      <Section title={t("profile.startingPointTitle")}>
        <StartingPointForm />
      </Section>

      <Section title={t("profile.passwordTitle")}>
        <ChangePasswordForm />
      </Section>

      <Section title={t("profile.recoveryTitle")}>
        <RecoveryCodeForm />
      </Section>

      <Section title={t("profile.themeTitle")}>
        <ThemeSelector />
      </Section>

      <Section title={t("profile.helpTitle")}>
        <nav aria-label={t("profile.helpTitle")} className="flex flex-col gap-1">
          <Button asChild variant="ghost" className="justify-start">
            <Link href="/perfil/bienvenida">{t("profile.seeWelcome")}</Link>
          </Button>
          <Button asChild variant="ghost" className="justify-start">
            <Link href="/perfil/consentimiento">{t("profile.readConsent")}</Link>
          </Button>
        </nav>
      </Section>

      <div className="flex flex-col gap-2">
        <LogoutButton />
        <Button asChild variant="outline">
          <Link href="/perfil/retiro">{t("profile.withdrawCta")}</Link>
        </Button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 pt-2">
        <h2 className="font-heading text-base font-semibold text-foreground">{title}</h2>
        {children}
      </CardContent>
    </Card>
  );
}
