import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { AuthHeading } from "@/app/(auth)/(entrada)/_components/auth-heading";
import { RecoverForm } from "@/features/access/components/recover-form";

export default async function RecoverPage() {
  const t = await getTranslations();

  return (
    <div className="flex flex-col gap-8">
      <AuthHeading title={t("access.recoverTitle")} subtitle={t("access.recoverSubtitle")} />
      <RecoverForm />
      <Link
        href="/login"
        className="text-center text-sm font-semibold text-sprout-ink underline-offset-4 hover:underline"
      >
        {t("access.backToLogin")}
      </Link>
    </div>
  );
}
