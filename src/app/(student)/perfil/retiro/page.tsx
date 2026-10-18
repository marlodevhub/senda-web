import { getTranslations } from "next-intl/server";
import { WithdrawalForm } from "@/features/profile/components/withdrawal-form";
import { BackLink } from "@/components/layout/back-link";

export default async function RetiroPage() {
  const t = await getTranslations();

  return (
    <div className="flex flex-col gap-5">
      <BackLink href="/perfil" />
      <h1 className="font-heading text-xl font-bold text-foreground">{t("profile.withdrawCta")}</h1>
      <WithdrawalForm />
    </div>
  );
}
