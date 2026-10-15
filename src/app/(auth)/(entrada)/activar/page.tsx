import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { AuthHeading } from "@/app/(auth)/(entrada)/_components/auth-heading";
import { ActivateForm } from "@/features/access/components/activate-form";

export default async function ActivarPage() {
  const t = await getTranslations();

  return (
    <div className="flex flex-col gap-8">
      <AuthHeading title={t("access.activateTitle")} subtitle={t("access.activateSubtitle")} />
      <ActivateForm />
      <p className="text-center text-sm text-muted-foreground">
        {t("access.alreadyActive")}{" "}
        <Link href="/login" className="font-semibold text-sprout-ink underline-offset-4 hover:underline">
          {t("access.loginLink")}
        </Link>
      </p>
    </div>
  );
}
