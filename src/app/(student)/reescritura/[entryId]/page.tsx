import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
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

  const t = await getTranslations();
  const parsedFindingId = findingId ? Number(findingId) : undefined;

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-heading text-xl font-bold text-foreground">{t("rewrite.title")}</h1>
      <RewriteForm
        journalEntryId={journalEntryId}
        findingId={Number.isInteger(parsedFindingId) ? parsedFindingId : undefined}
      />
    </div>
  );
}
