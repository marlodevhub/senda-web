import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { AuthHeading } from "@/app/(auth)/(entrada)/_components/auth-heading";
import { LoginForm } from "@/features/access/components/login-form";
import { InstallApp } from "@/components/pwa/install-app";

export default async function LoginPage() {
  const t = await getTranslations();

  return (
    <div className="flex flex-col gap-8">
      <AuthHeading title={t("access.loginTitle")} subtitle={t("access.loginSubtitle")} />
      <LoginForm />
      <p className="text-center text-base text-muted-foreground">
        {t("access.firstTime")}{" "}
        <Link
          href="/activar"
          className="inline-block py-2 font-semibold text-sprout-ink underline-offset-4 hover:underline"
        >
          {t("access.activateLink")}
        </Link>
      </p>
      {/* Instalar Senda con su ícono, si el navegador lo permite y aún no está instalada. */}
      <InstallApp />
    </div>
  );
}
