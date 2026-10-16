import { getTranslations } from "next-intl/server";
import { HistoryTabs } from "../_components/history-tabs";
import { PendingToRewrite } from "../_components/pending-to-rewrite";

/** Historial › Por reescribir. */
export default async function PorReescribirPage() {
  const t = await getTranslations();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-heading text-xl font-bold text-foreground">{t("history.title")}</h1>
      <HistoryTabs />
      <div className="mx-auto w-full max-w-2xl">
        <PendingToRewrite />
      </div>
    </div>
  );
}
