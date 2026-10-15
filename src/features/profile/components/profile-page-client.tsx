"use client";

import { useId } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { BookOpen, FileText, Loader2, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
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
 * Distribución bento: en escritorio, 6 columnas con tarjetas de distinto
 * ancho y alto (la contraseña y la barra ocupan dos filas, a su lado van dos
 * tarjetas más bajas); en tablet, 2 columnas con el mismo orden; en móvil, una.
 */
export function ProfilePageClient() {
  const t = useTranslations();
  const { data: profile, isPending, isError } = useProfile();
  const tour = useTour();

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
      <EmotionDefs />

      {/* md:mr-14: en tablet la campana de mensajes flota arriba a la derecha, sobre este encabezado. */}
      <header className="flex items-center gap-4 rounded-lg md:col-span-2 md:mr-14 md:bg-[linear-gradient(135deg,var(--bloom-tint),var(--flow-tint))] md:p-6 md:shadow-card lg:col-span-4 lg:mr-0">
        <EmotionCharacter emotion="calm" className="hidden w-20 shrink-0 md:block" />
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-xl font-bold text-foreground md:text-3xl">{t("profile.title")}</h1>
          <p className="text-base text-foreground/80">{t("profile.subtitle")}</p>
        </div>
      </header>

      <button
        type="button"
        onClick={() => tour?.start()}
        className="flex items-center gap-4 rounded-lg bg-flow-tint p-5 text-left text-flow-ink shadow-card transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-ring md:col-span-2 lg:flex-col lg:items-start lg:justify-between"
      >
        <EmotionCharacter emotion="joy" className="w-14 shrink-0 lg:w-16" />
        <span className="flex flex-col gap-0.5">
          <span className="font-heading text-lg font-bold">{t("profile.seeTour")}</span>
          <span className="text-base">{t("profile.helpTourHint")}</span>
        </span>
      </button>

      <Tile title={t("profile.notificationsTitle")} className="lg:col-span-3">
        {isPending ? (
          <Loader2 className="size-5 animate-spin text-muted-foreground" aria-label={t("common.loading")} />
        ) : isError || !profile ? (
          <p className="text-base text-muted-foreground">{t("common.unexpectedError")}</p>
        ) : (
          <NotificationsForm enabled={profile.notificationsEnabled} />
        )}
      </Tile>
      <Tile title={t("profile.startingPointTitle")} className="lg:col-span-3">
        <StartingPointForm />
      </Tile>

      <Tile title={t("profile.passwordTitle")} className="md:row-span-2 lg:col-span-3">
        <ChangePasswordForm />
      </Tile>
      <Tile title={t("profile.recoveryTitle")} className="lg:col-span-3">
        <RecoveryCodeForm />
      </Tile>
      <Tile title={t("profile.themeMode")} className="lg:col-span-3">
        <ThemeSelector />
      </Tile>

      <Tile title={t("profile.glassTitle")} className="md:row-span-2 lg:col-span-3">
        <GlassSettingsForm />
      </Tile>
      <HelpTile
        href="/perfil/bienvenida"
        icon={BookOpen}
        label={t("profile.seeWelcome")}
        hint={t("profile.helpWelcomeHint")}
        className="bg-root-tint text-root-ink lg:col-span-3"
      />
      <HelpTile
        href="/perfil/consentimiento"
        icon={FileText}
        label={t("profile.readConsent")}
        hint={t("profile.helpConsentHint")}
        className="bg-sprout-tint text-sprout-ink lg:col-span-3"
      />

      <Tile title={t("profile.groupSession")} className="bg-muted md:col-span-2 lg:col-span-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-base text-muted-foreground md:max-w-md">{t("profile.sessionHint")}</p>
          <div className="flex flex-col gap-2 md:shrink-0 md:flex-row">
            <LogoutButton />
            <Button asChild variant="outline">
              <Link href="/perfil/retiro">{t("profile.withdrawCta")}</Link>
            </Button>
          </div>
        </div>
      </Tile>
    </div>
  );
}

/** Una tarjeta del bento: su título la nombra como región. */
function Tile({ title, className, children }: { title: string; className?: string; children: React.ReactNode }) {
  const titleId = useId();
  return (
    <section
      aria-labelledby={titleId}
      className={cn("flex flex-col gap-3 rounded-lg bg-card p-5 text-card-foreground shadow-card", className)}
    >
      <h2 id={titleId} className="font-heading text-base font-semibold text-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

/** Acceso de "Ayuda e información" en su propio color. */
function HelpTile({
  href,
  icon: Icon,
  label,
  hint,
  className,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  hint: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-4 rounded-lg p-5 shadow-card transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-ring",
        className,
      )}
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-card/70">
        <Icon className="size-5" aria-hidden />
      </span>
      <span className="flex flex-col gap-0.5">
        <span className="text-base font-semibold">{label}</span>
        <span className="text-base opacity-90">{hint}</span>
      </span>
    </Link>
  );
}
