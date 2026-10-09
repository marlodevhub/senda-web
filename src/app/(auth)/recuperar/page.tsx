import { getTranslations } from "next-intl/server";
import { RecoverForm } from "@/features/access/components/recover-form";

export default async function RecoverPage() {
  const t = await getTranslations();

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1 text-center">
        <h2 className="font-heading text-lg font-semibold text-foreground">{t("access.recoverTitle")}</h2>
        <p className="text-sm text-muted-foreground">{t("access.recoverSubtitle")}</p>
      </div>
      <RecoverForm />
    </div>
  );
}
