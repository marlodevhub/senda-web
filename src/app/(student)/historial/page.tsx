import { getTranslations } from "next-intl/server";
import { EntryList } from "@/features/journal/components/entry-list";
import { HistoryTabs } from "./_components/history-tabs";

export default async function HistorialPage() {
  const t = await getTranslations();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-heading text-xl font-bold text-foreground">{t("history.title")}</h1>
      <HistoryTabs />
      <EntryList />
    </div>
  );
}
