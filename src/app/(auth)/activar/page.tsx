import { getTranslations } from "next-intl/server";
import { ActivateForm } from "@/features/access/components/activate-form";

export default async function ActivarPage() {
  const t = await getTranslations();

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1 text-center">
        <h2 className="font-heading text-lg font-semibold text-foreground">{t("access.activateTitle")}</h2>
        <p className="text-sm text-muted-foreground">{t("access.activateSubtitle")}</p>
      </div>
      <ActivateForm />
    </div>
  );
}
