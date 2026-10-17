import { notFound } from "next/navigation";
import { RewriteForm } from "@/features/rewrite/components/rewrite-form";

export default async function ReescrituraPage({
  params,
  searchParams,
}: {
  params: Promise<{ entryId: string }>;
  searchParams: Promise<{ findingId?: string }>;
}) {
  const { entryId } = await params;
  const { findingId } = await searchParams;
  const journalEntryId = Number(entryId);
  if (!Number.isInteger(journalEntryId)) {
    notFound();
  }

  const parsedFindingId = findingId ? Number(findingId) : undefined;

  return (
    <RewriteForm
      journalEntryId={journalEntryId}
      findingId={Number.isInteger(parsedFindingId) ? parsedFindingId : undefined}
    />
  );
}
