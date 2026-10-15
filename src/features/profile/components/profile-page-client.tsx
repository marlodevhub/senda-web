"use client";

import { useId } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { BookOpen, Compass, FileText, Loader2, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmotionCharacter, EmotionDefs } from "@/components/illustrations/emotion-characters";
import { useTour } from "@/components/tour/app-tour";
import { LogoutButton } from "@/features/access/components/logout-button";
import { useProfile } from "@/features/profile/api/use-profile";
import { ChangePasswordForm } from "@/features/profile/components/change-password-form";
import { NotificationsForm } from "@/features/profile/components/notifications-form";
import { RecoveryCodeForm } from "@/features/profile/components/recovery-code-form";
import { ThemeSelector } from "@/features/profile/components/theme-selector";
import { GlassSettingsForm } from "@/features/appearance/glass-settings-form";
import { StartingPointForm } from "@/features/welcome/components/starting-point-form";
import { cn } from "@/lib/utils";

/**
 * CU-20 Gestionar perfil (RN-AC-13): notificaciones por correo, contraseña,
 * código de recuperación, punto de partida (CU-17), ayuda e información
 * (volver a ver la bienvenida o el tutorial y leer el consentimiento), cerrar sesión y
 * retirarse (CU-21). Sin botón de "Necesito ayuda": Senda no es un servicio
 * de crisis (sección 15 del CLAUDE.md raíz).
 *
 * Móvil: una columna. Tablet y escritorio: grupos con sus tarjetas en dos
 * columnas, la ayuda en mosaico y la sesión en una franja al final.
 */
export function ProfilePageClient() {
  const t = useTranslations();
  const { data: profile, isPending, isError } = useProfile();
  const tour = useTour();

  return (
    <div className="flex flex-col gap-8 md:gap-10">
      {/* md:mr-14: en tablet la campana de mensajes flota arriba a la derecha, sobre este encabezado. */}
      <header className="flex items-center gap-4 md:mr-14 md:rounded-lg md:bg-card md:p-6 md:shadow-card xl:mr-0">
        <EmotionDefs />
        <EmotionCharacter emotion="calm" className="hidden w-20 shrink-0 md:block" />
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-xl font-bold text-foreground md:text-3xl">{t("profile.title")}</h1>
          <p className="text-base text-muted-foreground">{t("profile.subtitle")}</p>
        </div>
      </header>

      <Group title={t("profile.groupJourney")}>
        <Section title={t("profile.notificationsTitle")}>
          {isPending ? (
            <Loader2 className="size-5 animate-spin text-muted-foreground" aria-label={t("common.loading")} />
          ) : isError || !profile ? (
            <p className="text-base text-muted-foreground">{t("common.unexpectedError")}</p>
          ) : (
            <NotificationsForm enabled={profile.notificationsEnabled} />
          )}
        </Section>
        <Section title={t("profile.startingPointTitle")}>
          <StartingPointForm />
        </Section>
      </Group>

      <Group title={t("profile.groupSecurity")}>
        <Section title={t("profile.passwordTitle")}>
          <ChangePasswordForm />
        </Section>
        <Section title={t("profile.recoveryTitle")}>
          <RecoveryCodeForm />
        </Section>
      </Group>

      <Group title={t("profile.themeTitle")}>
        <Section title={t("profile.themeMode")}>
          <ThemeSelector />
        </Section>
        <Section title={t("profile.glassTitle")}>
          <GlassSettingsForm />
        </Section>
      </Group>

      <Group title={t("profile.helpTitle")} as="nav" columns={3}>
        <HelpTile
          href="/perfil/bienvenida"
          icon={BookOpen}
          label={t("profile.seeWelcome")}
          hint={t("profile.helpWelcomeHint")}
        />
        <HelpTile
          onClick={() => tour?.start()}
          icon={Compass}
          label={t("profile.seeTour")}
          hint={t("profile.helpTourHint")}
        />
        <HelpTile
          href="/perfil/consentimiento"
          icon={FileText}
          label={t("profile.readConsent")}
          hint={t("profile.helpConsentHint")}
        />
      </Group>

      <section aria-labelledby="profile-session" className="flex flex-col gap-3">
        <h2 id="profile-session" className="font-heading text-lg font-bold text-foreground">
          {t("profile.groupSession")}
        </h2>
        <Card>
          <CardContent className="flex flex-col gap-4 pt-2 md:flex-row md:items-center md:justify-between">
            <p className="text-base text-muted-foreground md:max-w-sm">{t("profile.sessionHint")}</p>
            <div className="flex flex-col gap-2 md:flex-row md:shrink-0">
              <LogoutButton />
              <Button asChild variant="outline">
                <Link href="/perfil/retiro">{t("profile.withdrawCta")}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

/** Un grupo de ajustes: título y sus tarjetas, en dos (o tres) columnas desde tablet. */
function Group({
  title,
  as: Tag = "section",
  columns = 2,
  children,
}: {
  title: string;
  as?: "section" | "nav";
  columns?: 2 | 3;
  children: React.ReactNode;
}) {
  const titleId = useId();
  return (
    <Tag aria-labelledby={titleId} className="flex flex-col gap-3">
      <h2 id={titleId} className="font-heading text-lg font-bold text-foreground">
        {title}
      </h2>
      <div className={cn("grid gap-4", columns === 3 ? "md:grid-cols-3" : "md:grid-cols-2")}>{children}</div>
    </Tag>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="h-full">
      <CardContent className="flex flex-col gap-3 pt-2">
        <h3 className="font-heading text-base font-semibold text-foreground">{title}</h3>
        {children}
      </CardContent>
    </Card>
  );
}

/** Acceso de "Ayuda e información": enlace o botón (el tutorial se abre aquí mismo). */
function HelpTile({
  href,
  onClick,
  icon: Icon,
  label,
  hint,
}: {
  href?: string;
  onClick?: () => void;
  icon: LucideIcon;
  label: string;
  hint: string;
}) {
  const className =
    "flex h-full items-start gap-3 rounded-lg bg-card p-4 text-left shadow-card transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring md:flex-col";
  const content = (
    <>
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-flow-tint text-flow-ink">
        <Icon className="size-5" aria-hidden />
      </span>
      <span className="flex flex-col gap-0.5">
        <span className="text-base font-semibold text-foreground">{label}</span>
        <span className="text-base text-muted-foreground">{hint}</span>
      </span>
    </>
  );
  return href ? (
    <Link href={href} className={className}>
      {content}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
}
