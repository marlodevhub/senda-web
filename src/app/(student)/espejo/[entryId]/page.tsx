import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { MirrorPageClient } from "@/features/analysis/components/mirror-page-client";

export default async function EspejoPage({ params }: { params: Promise<{ entryId: string }> }) {
  const { entryId } = await params;
  const journalEntryId = Number(entryId);
  if (!Number.isInteger(journalEntryId)) {
    notFound();
  }

  const t = await getTranslations();

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-heading text-xl font-bold text-foreground">{t("analysis.title")}</h1>
      <MirrorPageClient journalEntryId={journalEntryId} />
    </div>
  );
}
