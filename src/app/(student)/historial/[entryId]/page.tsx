import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { EntryDetail } from "@/features/journal/components/entry-detail";

export default async function HistorialDetailPage({ params }: { params: Promise<{ entryId: string }> }) {
  const { entryId } = await params;
  const journalEntryId = Number(entryId);
  if (!Number.isInteger(journalEntryId)) {
    notFound();
  }

  const t = await getTranslations();

  return (
    <div className="flex flex-col gap-5">
      <Link href="/historial" className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
        <ArrowLeft className="size-4" aria-hidden />
        {t("history.back")}
      </Link>
      <h1 className="font-heading text-xl font-bold text-foreground">{t("history.detailTitle")}</h1>
      <EntryDetail journalEntryId={journalEntryId} />
    </div>
  );
}
