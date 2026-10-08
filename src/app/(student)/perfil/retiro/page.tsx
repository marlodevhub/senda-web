import { getTranslations } from "next-intl/server";
import { WithdrawalForm } from "@/features/profile/components/withdrawal-form";

export default async function RetiroPage() {
  const t = await getTranslations();

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-heading text-xl font-bold text-foreground">{t("profile.withdrawCta")}</h1>
      <WithdrawalForm />
    </div>
  );
}
