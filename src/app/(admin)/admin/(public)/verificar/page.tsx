import { getTranslations } from "next-intl/server";
import { TotpForm } from "@/features/admin/components/totp-form";

export default async function AdminVerifyPage() {
  const t = await getTranslations();

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1 text-center">
        <h2 className="font-heading text-lg font-semibold text-foreground">{t("admin.verifyTitle")}</h2>
        <p className="text-sm text-muted-foreground">{t("admin.verifySubtitle")}</p>
      </div>
      <TotpForm />
    </div>
  );
}
