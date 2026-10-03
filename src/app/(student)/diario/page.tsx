import { getTranslations } from "next-intl/server";
import { JournalForm } from "@/features/journal/components/journal-form";

export default async function DiarioPage() {
  const t = await getTranslations();

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-heading text-xl font-bold text-foreground">{t("journal.subtitle")}</h1>
      </div>
      <JournalForm />
    </div>
  );
}
