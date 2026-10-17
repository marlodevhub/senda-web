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
    <div className="flex flex-col gap-4">
      <Link
        href="/historial"
        className="flex w-fit items-center gap-1.5 rounded-full px-1 text-base font-semibold text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {t("history.back")}
      </Link>
      <EntryDetail journalEntryId={journalEntryId} />
    </div>
  );
}
