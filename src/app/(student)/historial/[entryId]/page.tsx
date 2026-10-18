import { notFound } from "next/navigation";
import { EntryDetail } from "@/features/journal/components/entry-detail";
import { BackLink } from "@/components/layout/back-link";

export default async function HistorialDetailPage({ params }: { params: Promise<{ entryId: string }> }) {
  const { entryId } = await params;
  const journalEntryId = Number(entryId);
  if (!Number.isInteger(journalEntryId)) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-4">
      <BackLink href="/historial" />
      <EntryDetail journalEntryId={journalEntryId} />
    </div>
  );
}
